import { and, desc, eq, gte, lte } from "drizzle-orm";
import { emailLogs } from "@/lib/database/schema/email-schema";
import { database } from "@/lib/database/server";
import type { EmailPriority, EmailStatus, EmailTemplate } from "../types/email-types";
import { EMAIL_STATUS } from "../types/email-types";

/**
 * Email Logger Service
 * خدمة تسجيل البريد الإلكتروني في قاعدة البيانات
 */

export class EmailLogger {
  /**
   * Create a new email log entry
   * إنشاء سجل بريد جديد
   */
  async createLog(data: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    template: EmailTemplate;
    templateData?: Record<string, unknown>;
    status?: EmailStatus;
    priority?: EmailPriority;
    userId?: string;
    metadata?: Record<string, unknown>;
    scheduledAt?: Date;
  }): Promise<{ id: string }> {
    try {
      const toStr = Array.isArray(data.to) ? data.to.join(", ") : data.to;
      const ccStr = data.cc ? (Array.isArray(data.cc) ? data.cc.join(", ") : data.cc) : undefined;
      const bccStr = data.bcc
        ? Array.isArray(data.bcc)
          ? data.bcc.join(", ")
          : data.bcc
        : undefined;

      const [log] = await database
        .insert(emailLogs)
        .values({
          to: toStr,
          from: process.env.SMTP_FROM || "noreply@h-case-radar.com",
          cc: ccStr,
          bcc: bccStr,
          subject: data.subject,
          template: data.template,
          templateData: data.templateData,
          status: data.status || EMAIL_STATUS.PENDING,
          priority: data.priority || "normal",
          userId: data.userId,
          metadata: data.metadata,
          scheduledAt: data.scheduledAt,
          attempts: 0,
          maxAttempts: 3,
        })
        .returning({ id: emailLogs.id });

      console.log(`📝 Email log created: ${log.id}`);
      return { id: log.id };
    } catch (error) {
      console.error("❌ Failed to create email log:", error);
      throw error;
    }
  }

  /**
   * Update email log status
   * تحديث حالة سجل البريد
   */
  async updateStatus(
    logId: string,
    status: EmailStatus,
    data?: {
      messageId?: string;
      errorMessage?: string;
      errorStack?: string;
    },
  ): Promise<void> {
    try {
      const updates: Partial<typeof emailLogs.$inferInsert> = {
        status,
        updatedAt: new Date(),
      };

      if (status === EMAIL_STATUS.SENT) {
        updates.sentAt = new Date();
      } else if (status === EMAIL_STATUS.FAILED) {
        updates.failedAt = new Date();
        updates.errorMessage = data?.errorMessage;
        updates.errorStack = data?.errorStack;
      }

      await database.update(emailLogs).set(updates).where(eq(emailLogs.id, logId));

      console.log(`📝 Email log ${logId} updated to ${status}`);
    } catch (error) {
      console.error(`❌ Failed to update email log ${logId}:`, error);
      throw error;
    }
  }

  /**
   * Increment attempt count
   * زيادة عدد المحاولات
   */
  async incrementAttempts(logId: string): Promise<number> {
    try {
      const [log] = await database
        .select({ attempts: emailLogs.attempts })
        .from(emailLogs)
        .where(eq(emailLogs.id, logId));

      if (!log) {
        throw new Error(`Email log ${logId} not found`);
      }

      const newAttempts = log.attempts + 1;

      await database
        .update(emailLogs)
        .set({
          attempts: newAttempts,
          lastAttemptAt: new Date(),
        })
        .where(eq(emailLogs.id, logId));

      console.log(`📝 Email log ${logId} attempts: ${newAttempts}`);
      return newAttempts;
    } catch (error) {
      console.error(`❌ Failed to increment attempts for ${logId}:`, error);
      throw error;
    }
  }

  /**
   * Get email log by ID
   * الحصول على سجل بريد بواسطة المعرف
   */
  async getLog(logId: string) {
    try {
      const [log] = await database.select().from(emailLogs).where(eq(emailLogs.id, logId));

      return log;
    } catch (error) {
      console.error(`❌ Failed to get email log ${logId}:`, error);
      throw error;
    }
  }

  /**
   * Get logs by status
   * الحصول على السجلات حسب الحالة
   */
  async getLogsByStatus(status: EmailStatus, limit = 100) {
    try {
      const logs = await database
        .select()
        .from(emailLogs)
        .where(eq(emailLogs.status, status))
        .orderBy(desc(emailLogs.createdAt))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error(`❌ Failed to get email logs by status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Get logs by user ID
   * الحصول على السجلات حسب معرف المستخدم
   */
  async getLogsByUserId(userId: string, limit = 50) {
    try {
      const logs = await database
        .select()
        .from(emailLogs)
        .where(eq(emailLogs.userId, userId))
        .orderBy(desc(emailLogs.createdAt))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error(`❌ Failed to get email logs for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get logs by date range
   * الحصول على السجلات حسب نطاق التاريخ
   */
  async getLogsByDateRange(startDate: Date, endDate: Date) {
    try {
      const logs = await database
        .select()
        .from(emailLogs)
        .where(and(gte(emailLogs.createdAt, startDate), lte(emailLogs.createdAt, endDate)))
        .orderBy(desc(emailLogs.createdAt));

      return logs;
    } catch (error) {
      console.error("❌ Failed to get email logs by date range:", error);
      throw error;
    }
  }

  /**
   * Get failed logs that can be retried
   * الحصول على السجلات الفاشلة التي يمكن إعادة محاولتها
   */
  async getRetryableLogs(limit = 50) {
    try {
      const logs = await database.query.emailLogs.findMany({
        where: (emailLogs, { eq, and, lt }) =>
          and(
            eq(emailLogs.status, EMAIL_STATUS.FAILED),
            lt(emailLogs.attempts, emailLogs.maxAttempts),
          ),
        orderBy: (emailLogs, { asc }) => [asc(emailLogs.lastAttemptAt)],
        limit,
      });

      return logs;
    } catch (error) {
      console.error("❌ Failed to get retryable email logs:", error);
      throw error;
    }
  }

  /**
   * Get pending/queued logs
   * الحصول على السجلات قيد الانتظار
   */
  async getPendingLogs(limit = 100) {
    try {
      const now = new Date();

      const logs = await database.query.emailLogs.findMany({
        where: (emailLogs, { eq, or, and, lte, isNull }) =>
          and(
            or(
              eq(emailLogs.status, EMAIL_STATUS.PENDING),
              eq(emailLogs.status, EMAIL_STATUS.QUEUED),
            ),
            or(isNull(emailLogs.scheduledAt), lte(emailLogs.scheduledAt, now)),
          ),
        orderBy: (emailLogs, { asc }) => [
          asc(emailLogs.priority), // urgent أولاً
          asc(emailLogs.createdAt),
        ],
        limit,
      });

      return logs;
    } catch (error) {
      console.error("❌ Failed to get pending email logs:", error);
      throw error;
    }
  }

  /**
   * Delete old logs
   * حذف السجلات القديمة
   */
  async deleteOldLogs(daysToKeep = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deleted = await database
        .delete(emailLogs)
        .where(lte(emailLogs.createdAt, cutoffDate))
        .returning({ id: emailLogs.id });

      console.log(`🗑️ Deleted ${deleted.length} old email logs`);
      return deleted.length;
    } catch (error) {
      console.error("❌ Failed to delete old email logs:", error);
      throw error;
    }
  }


  /**
   * Get statistics
   * الحصول على إحصائيات البريد
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    try {
      let logs: typeof emailLogs.$inferSelect[];

      if (startDate && endDate) {
        logs = await database
          .select()
          .from(emailLogs)
          .where(
            and(gte(emailLogs.createdAt, startDate), lte(emailLogs.createdAt, endDate))
          );
      } else {
        logs = await database.select().from(emailLogs);
      }

      const stats = {
        total: logs.length,
        sent: logs.filter((l) => l.status === EMAIL_STATUS.SENT).length,
        failed: logs.filter((l) => l.status === EMAIL_STATUS.FAILED).length,
        pending: logs.filter((l) => l.status === EMAIL_STATUS.PENDING).length,
        queued: logs.filter((l) => l.status === EMAIL_STATUS.QUEUED).length,
        successRate: 0,
      };

      if (stats.total > 0) {
        stats.successRate = (stats.sent / stats.total) * 100;
      }

      return stats;
    } catch (error) {
      console.error("❌ Failed to get email statistics:", error);
      throw error;
    }
  }

}

// Singleton instance
export const emailLogger = new EmailLogger();
