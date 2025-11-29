import { EMAIL_CONFIG, getEffectiveRecipient } from "../config/email-config";
import { emailLogger } from "../core/email-logger";
import { emailTransport } from "../core/email-transport";
import type { EmailSendResult, EmailTemplate, EmailWithTemplate } from "../types/email-types";
import { EMAIL_STATUS } from "../types/email-types";

/**
 * Email Service
 * الخدمة الرئيسية لإرسال البريد الإلكتروني
 */

export class EmailService {
  /**
   * Send an email using a template
   * إرسال بريد باستخدام قالب
   */
  async send<T extends EmailTemplate>(email: EmailWithTemplate<T>): Promise<EmailSendResult> {
    // Check if email sending is enabled
    if (!EMAIL_CONFIG.production.enabled && process.env.NODE_ENV === "production") {
      console.warn("⚠️ Email sending is disabled in production");
      return { success: false, error: "Email sending is disabled" };
    }

    try {
      // Get effective recipient (handle test mode)
      const effectiveTo = getEffectiveRecipient(email.to);
      const effectiveCc = email.cc ? getEffectiveRecipient(email.cc) : undefined;
      const effectiveBcc = email.bcc ? getEffectiveRecipient(email.bcc) : undefined;

      // Create log entry if logging is enabled
      let logId: string | undefined;
      if (EMAIL_CONFIG.features.enableLogging) {
        const log = await emailLogger.createLog({
          to: effectiveTo,
          cc: effectiveCc,
          bcc: effectiveBcc,
          subject: email.subject,
          template: email.template,
          templateData: email.templateData as Record<string, unknown>,
          priority: email.priority,
          userId: email.userId,
          metadata: email.metadata,
          scheduledAt: email.scheduledAt,
          status: email.scheduledAt ? EMAIL_STATUS.QUEUED : EMAIL_STATUS.PENDING,
        });
        logId = log.id;
      }

      // If scheduled for future, queue it
      if (email.scheduledAt && email.scheduledAt > new Date()) {
        console.log(`⏰ Email scheduled for ${email.scheduledAt}`);
        return {
          success: true,
          logId,
        };
      }

      // Render the template
      const { html, text } = await this.renderTemplate(email.template, email.templateData as Record<string, unknown>);

      // Send the email
      const result = await emailTransport.send({
        to: effectiveTo,
        cc: effectiveCc,
        bcc: effectiveBcc,
        subject: email.subject,
        html,
        text,
      });

      // Update log
      if (logId) {
        if (result.success) {
          await emailLogger.updateStatus(logId, EMAIL_STATUS.SENT, {
            messageId: result.messageId,
          });
        } else {
          await emailLogger.updateStatus(logId, EMAIL_STATUS.FAILED, {
            errorMessage: result.error,
          });
        }
      }

      return {
        success: result.success,
        logId,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Failed to send email:", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send multiple emails (batch)
   * إرسال عدة رسائل دفعة واحدة
   */
  async sendBatch<T extends EmailTemplate>(
    emails: EmailWithTemplate<T>[],
  ): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = [];

    // Process in chunks to avoid overwhelming the server
    const chunkSize = EMAIL_CONFIG.queue.maxConcurrent;

    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(chunk.map((email) => this.send(email)));
      results.push(...chunkResults);

      // Small delay between chunks
      if (i + chunkSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Retry failed emails
   * إعادة محاولة إرسال الرسائل الفاشلة
   */
  async retryFailed(limit = 50): Promise<number> {
    if (!EMAIL_CONFIG.features.enableRetry) {
      console.warn("⚠️ Email retry is disabled");
      return 0;
    }

    try {
      const failedLogs = await emailLogger.getRetryableLogs(limit);
      console.log(`🔄 Retrying ${failedLogs.length} failed emails`);

      let successCount = 0;

      for (const log of failedLogs) {
        try {
          // Increment attempt counter
          const attempts = await emailLogger.incrementAttempts(log.id);

          // Calculate retry delay with exponential backoff
          const delay =
            EMAIL_CONFIG.retry.retryDelay * EMAIL_CONFIG.retry.backoffMultiplier ** (attempts - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Render template
          const { html, text } = await this.renderTemplate(
            log.template as EmailTemplate,
            log.templateData as Record<string, unknown>,
          );

          // Send
          const result = await emailTransport.send({
            to: log.to,
            cc: log.cc || undefined,
            bcc: log.bcc || undefined,
            subject: log.subject,
            html,
            text,
          });

          // Update status
          if (result.success) {
            await emailLogger.updateStatus(log.id, EMAIL_STATUS.SENT, {
              messageId: result.messageId,
            });
            successCount++;
          } else {
            await emailLogger.updateStatus(log.id, EMAIL_STATUS.FAILED, {
              errorMessage: result.error,
            });
          }
        } catch (error) {
          console.error(`❌ Failed to retry email ${log.id}:`, error);
        }
      }

      console.log(`✅ Successfully retried ${successCount}/${failedLogs.length} emails`);
      return successCount;
    } catch (error) {
      console.error("❌ Failed to retry emails:", error);
      return 0;
    }
  }

  /**
   * Process pending emails
   * معالجة الرسائل المعلقة
   */
  async processPending(limit = 100): Promise<number> {
    try {
      const pendingLogs = await emailLogger.getPendingLogs(limit);
      console.log(`📧 Processing ${pendingLogs.length} pending emails`);

      let successCount = 0;

      for (const log of pendingLogs) {
        try {
          // Render template
          const { html, text } = await this.renderTemplate(
            log.template as EmailTemplate,
            log.templateData as Record<string, unknown>,
          );

          // Send
          const result = await emailTransport.send({
            to: log.to,
            cc: log.cc || undefined,
            bcc: log.bcc || undefined,
            subject: log.subject,
            html,
            text,
          });

          // Update status
          if (result.success) {
            await emailLogger.updateStatus(log.id, EMAIL_STATUS.SENT, {
              messageId: result.messageId,
            });
            successCount++;
          } else {
            await emailLogger.incrementAttempts(log.id);
            await emailLogger.updateStatus(log.id, EMAIL_STATUS.FAILED, {
              errorMessage: result.error,
            });
          }
        } catch (error) {
          console.error(`❌ Failed to process email ${log.id}:`, error);
        }
      }

      console.log(`✅ Successfully processed ${successCount}/${pendingLogs.length} emails`);
      return successCount;
    } catch (error) {
      console.error("❌ Failed to process pending emails:", error);
      return 0;
    }
  }

  /**
   * Render a template
   * عرض القالب باستخدام React Email
   */
  private async renderTemplate(
    template: EmailTemplate,
    data: Record<string, unknown>,
  ): Promise<{ html: string; text: string }> {
    const { renderEmailTemplate } = await import("../core/template-renderer");
    return renderEmailTemplate(template, data);
  }


  /**
   * Verify email server connection
   * التحقق من اتصال خادم البريد
   */
  async verifyConnection(): Promise<boolean> {
    return await emailTransport.verifyConnection();
  }

  /**
   * Get email statistics
   * الحصول على إحصائيات البريد
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    return await emailLogger.getStatistics(startDate, endDate);
  }

  /**
   * Clean up old logs
   * تنظيف السجلات القديمة
   */
  async cleanupOldLogs(daysToKeep = 90): Promise<number> {
    return await emailLogger.deleteOldLogs(daysToKeep);
  }
}

// Singleton instance
export const emailService = new EmailService();

// Convenience functions
export async function sendEmail<T extends EmailTemplate>(
  email: EmailWithTemplate<T>,
): Promise<EmailSendResult> {
  return emailService.send(email);
}

export async function sendBatchEmails<T extends EmailTemplate>(
  emails: EmailWithTemplate<T>[],
): Promise<EmailSendResult[]> {
  return emailService.sendBatch(emails);
}
