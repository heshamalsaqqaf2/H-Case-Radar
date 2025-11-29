import type { InferSelectModel } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Email Logs Table
 * سجل شامل لجميع رسائل البريد المرسلة من النظام
 */
export const emailLogs = pgTable("email_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  // معلومات المرسل والمستقبل
  to: text("to").notNull(), // البريد المستلم
  from: text("from").notNull(), // البريد المرسل
  cc: text("cc"), // نسخة كربونية
  bcc: text("bcc"), // نسخة كربونية مخفية

  // المحتوى
  subject: text("subject").notNull(), // الموضوع
  template: text("template").notNull(), // اسم القالب المستخدم

  // البيانات
  templateData: jsonb("template_data"), // البيانات الممررة للقالب

  // الحالة
  status: text("status").notNull().default("pending"),
  // pending: في الانتظار
  // sent: تم الإرسال
  // failed: فشل الإرسال
  // queued: في الطابور

  errorMessage: text("error_message"), // رسالة الخطأ إن وجدت
  errorStack: text("error_stack"), // Stack trace للخطأ

  // المحاولات (Retry Logic)
  attempts: integer("attempts").notNull().default(0), // عدد المحاولات
  maxAttempts: integer("max_attempts").notNull().default(3), // الحد الأقصى
  lastAttemptAt: timestamp("last_attempt_at"), // آخر محاولة

  // التوقيت
  scheduledAt: timestamp("scheduled_at"), // موعد الإرسال المجدول
  sentAt: timestamp("sent_at"), // وقت الإرسال الفعلي
  failedAt: timestamp("failed_at"), // وقت الفشل
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // البيانات الوصفية
  metadata: jsonb("metadata"), // بيانات إضافية (complaintId, etc.)

  // الأولوية
  priority: text("priority").notNull().default("normal"),
  // low, normal, high, urgent

  // المستخدم المرتبط (اختياري)
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),

  // تتبع الفتح والنقر (للمستقبل)
  opened: boolean("opened").default(false),
  openedAt: timestamp("opened_at"),
  clicked: boolean("clicked").default(false),
  clickedAt: timestamp("clicked_at"),
});

/**
 * Email Preferences Table
 * تفضيلات البريد الإلكتروني لكل مستخدم
 */
export const emailPreferences = pgTable("email_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),

  // تفعيل/تعطيل البريد
  emailEnabled: boolean("email_enabled").notNull().default(true),

  // تفضيلات تفصيلية (JSON)
  preferences: jsonb("preferences").default({
    // الشكاوى
    complaint_assigned: true,
    complaint_status_updated: true,
    complaint_commented: true,
    complaint_resolved: true,
    complaint_escalated: true,

    // SLA
    sla_warning: true,
    sla_exceeded: true,

    // الحساب
    account_status_changed: true,
    password_reset: true,

    // التقارير
    weekly_report: false,
    monthly_report: false,
  }),

  // تكرار التقارير
  reportFrequency: text("report_frequency").default("never"), // never, daily, weekly, monthly

  // أوقات الهدوء (لا ترسل في هذه الأوقات)
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
  quietHoursStart: text("quiet_hours_start"), // "22:00"
  quietHoursEnd: text("quiet_hours_end"), // "08:00"
  quietHoursTimezone: text("quiet_hours_timezone").default("Asia/Riyadh"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Types
export type EmailLog = InferSelectModel<typeof emailLogs>;
export type NewEmailLog = typeof emailLogs.$inferInsert;
export type EmailPreference = InferSelectModel<typeof emailPreferences>;
export type NewEmailPreference = typeof emailPreferences.$inferInsert;
