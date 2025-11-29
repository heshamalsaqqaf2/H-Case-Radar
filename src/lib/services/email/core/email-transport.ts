import nodemailer from "nodemailer";
import { EMAIL_CONFIG, formatFromAddress, validateEmailConfig } from "../config/email-config";

/**
 * Email Transport Service
 * خدمة النقل للبريد الإلكتروني باستخدام Nodemailer
 */

class EmailTransport {
  private transporter: nodemailer.Transporter | null = null;
  private isInitialized = false;
  private lastConnectionCheck: Date | null = null;

  /**
   * Initialize the email transporter
   * تهيئة ناقل البريد
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized && this.transporter) {
      return;
    }

    // التحقق من الإعدادات
    const validation = validateEmailConfig();
    if (!validation.valid) {
      console.error("❌ Email configuration is invalid:");
      for (const error of validation.errors) {
        console.error(`  - ${error}`);
      }
      throw new Error("Invalid email configuration");
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: EMAIL_CONFIG.smtp.host,
        port: EMAIL_CONFIG.smtp.port,
        secure: EMAIL_CONFIG.smtp.secure,
        auth: {
          user: EMAIL_CONFIG.smtp.auth.user,
          pass: EMAIL_CONFIG.smtp.auth.pass,
        },
        pool: true, // استخدام connection pool
        maxConnections: EMAIL_CONFIG.queue.maxConcurrent,
        maxMessages: 100, // عدد الرسائل لكل اتصال
        rateDelta: 60000, // نافذة زمنية للـ rate limit (1 دقيقة)
        rateLimit: EMAIL_CONFIG.rateLimit.maxPerMinute,
      });

      this.isInitialized = true;
      console.log("✅ Email transporter initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize email transporter:", error);
      throw error;
    }
  }

  /**
   * Verify the connection
   * التحقق من الاتصال بخادم البريد
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.initialize();

      if (!this.transporter) {
        throw new Error("Transporter not initialized");
      }

      await this.transporter.verify();
      this.lastConnectionCheck = new Date();
      console.log("✅ Email server connection verified");
      return true;
    } catch (error) {
      console.error("❌ Email server connection failed:", error);
      return false;
    }
  }

  /**
   * Send an email
   * إرسال بريد إلكتروني
   */
  async send(options: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    attachments?: Array<{
      filename: string;
      content?: string | Buffer;
      path?: string;
    }>;
  }): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      await this.initialize();

      if (!this.transporter) {
        throw new Error("Transporter not initialized");
      }

      // تحويل المصفوفات إلى strings
      const to = Array.isArray(options.to) ? options.to.join(", ") : options.to;
      const cc = options.cc
        ? Array.isArray(options.cc)
          ? options.cc.join(", ")
          : options.cc
        : undefined;
      const bcc = options.bcc
        ? Array.isArray(options.bcc)
          ? options.bcc.join(", ")
          : options.bcc
        : undefined;

      const result = await this.transporter.sendMail({
        from: options.from || formatFromAddress(),
        to,
        cc,
        bcc,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      console.log(`✅ Email sent successfully: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
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
   * Close the transporter
   * إغلاق الناقل
   */
  async close(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
      this.isInitialized = false;
      console.log("✅ Email transporter closed");
    }
  }

  /**
   * Get transporter instance
   * الحصول على نسخة الناقل
   */
  getTransporter(): nodemailer.Transporter | null {
    return this.transporter;
  }

  /**
   * Check if initialized
   * التحقق من التهيئة
   */
  isReady(): boolean {
    return this.isInitialized && this.transporter !== null;
  }

  /**
   * Get last connection check time
   * الحصول على وقت آخر فحص للاتصال
   */
  getLastConnectionCheck(): Date | null {
    return this.lastConnectionCheck;
  }
}

// Singleton instance
export const emailTransport = new EmailTransport();

// Export for testing purposes
export { EmailTransport };
