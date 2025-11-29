import { z } from "zod";

/**
 * Email Types
 * تعريفات TypeScript لأنواع البريد الإلكتروني
 */

// حالات البريد
export const EMAIL_STATUS = {
  PENDING: "pending",
  QUEUED: "queued",
  SENT: "sent",
  FAILED: "failed",
} as const;

export type EmailStatus = (typeof EMAIL_STATUS)[keyof typeof EMAIL_STATUS];

// الأولويات
export const EMAIL_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type EmailPriority = (typeof EMAIL_PRIORITY)[keyof typeof EMAIL_PRIORITY];

// أنواع القوالب
export const EMAIL_TEMPLATES = {
  // Authentication & Users
  WELCOME: "welcome",
  CREDENTIALS: "credentials",
  PASSWORD_RESET: "password_reset",
  EMAIL_VERIFICATION: "email_verification",
  ACCOUNT_APPROVED: "account_approved",
  ACCOUNT_REJECTED: "account_rejected",

  // Complaints
  COMPLAINT_CREATED: "complaint_created",
  COMPLAINT_ASSIGNED: "complaint_assigned",
  COMPLAINT_STATUS_UPDATED: "complaint_status_updated",
  COMPLAINT_COMMENTED: "complaint_commented",
  COMPLAINT_RESOLVED: "complaint_resolved",
  COMPLAINT_CLOSED: "complaint_closed",
  COMPLAINT_ESCALATED: "complaint_escalated",
  COMPLAINT_REOPENED: "complaint_reopened",

  // SLA
  SLA_WARNING: "sla_warning",
  SLA_EXCEEDED: "sla_exceeded",

  // Reports
  WEEKLY_REPORT: "weekly_report",
  MONTHLY_REPORT: "monthly_report",
  CUSTOM_REPORT: "custom_report",

  // System
  SYSTEM_ANNOUNCEMENT: "system_announcement",
} as const;

export type EmailTemplate = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];

/**
 * Base Email Interface
 * الواجهة الأساسية لجميع أنواع البريد
 */
export interface BaseEmail {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  priority?: EmailPriority;
  scheduledAt?: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Email Template Data Types
 * أنواع البيانات لكل قالب
 */

// Authentication Templates Data
export interface CredentialsEmailData {
  userName: string;
  email: string;
  password: string;
  loginUrl: string;
}

export interface WelcomeEmailData {
  userName: string;
  dashboardUrl: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiresIn: string; // e.g., "1 hour"
}

export interface EmailVerificationData {
  userName: string;
  verificationUrl: string;
  expiresIn: string;
}

export interface AccountStatusEmailData {
  userName: string;
  status: "approved" | "rejected";
  reason?: string;
  loginUrl?: string;
}

// Complaint Templates Data
export interface ComplaintCreatedEmailData {
  userName: string;
  complaintId: string;
  complaintTitle: string;
  category: string;
  priority: string;
  complaintUrl: string;
}

export interface ComplaintAssignedEmailData {
  userName: string;
  complaintId: string;
  complaintTitle: string;
  category: string;
  priority: string;
  assignedBy: string;
  dueDate?: string;
  complaintUrl: string;
}

export interface ComplaintStatusUpdatedEmailData {
  userName: string;
  complaintId: string;
  complaintTitle: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
  complaintUrl: string;
}

export interface ComplaintCommentedEmailData {
  userName: string;
  complaintId: string;
  complaintTitle: string;
  commenterName: string;
  commentPreview: string;
  complaintUrl: string;
}

export interface ComplaintResolvedEmailData {
  userName: string;
  complaintId: string;
  complaintTitle: string;
  resolvedBy: string;
  resolutionNotes: string;
  resolutionTime: string; // e.g., "2 days"
  complaintUrl: string;
}

export interface ComplaintEscalatedEmailData {
  managerName: string;
  complaintId: string;
  complaintTitle: string;
  priority: string;
  escalationReason: string;
  assignedTo: string;
  dueDate: string;
  complaintUrl: string;
}

export interface SLAWarningEmailData {
  userName: string;
  complaintId: string;
  complaintTitle: string;
  priority: string;
  remainingTime: string; // e.g., "30 minutes"
  dueDate: string;
  complaintUrl: string;
}

export interface SLAExceededEmailData {
  managerName: string;
  complaintId: string;
  complaintTitle: string;
  priority: string;
  assignedTo: string;
  exceededBy: string; // e.g., "2 hours"
  complaintUrl: string;
}

// Report Templates Data
export interface WeeklyReportEmailData {
  userName: string;
  weekRange: string; // e.g., "Nov 1 - Nov 7, 2024"
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  averageResolutionTime: string;
  reportUrl: string;
}

export interface MonthlyReportEmailData {
  userName: string;
  month: string; // e.g., "November 2024"
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  averageResolutionTime: string;
  topCategories: Array<{ category: string; count: number }>;
  reportUrl: string;
}

/**
 * Email with Template Data
 * دمج البريد الأساسي مع بيانات القالب
 */
export type EmailWithTemplate<T extends EmailTemplate = EmailTemplate> = BaseEmail & {
  template: T;
  templateData: T extends typeof EMAIL_TEMPLATES.CREDENTIALS
  ? CredentialsEmailData
  : T extends typeof EMAIL_TEMPLATES.WELCOME
  ? WelcomeEmailData
  : T extends typeof EMAIL_TEMPLATES.PASSWORD_RESET
  ? PasswordResetEmailData
  : T extends typeof EMAIL_TEMPLATES.EMAIL_VERIFICATION
  ? EmailVerificationData
  : T extends typeof EMAIL_TEMPLATES.ACCOUNT_APPROVED | typeof EMAIL_TEMPLATES.ACCOUNT_REJECTED
  ? AccountStatusEmailData
  : T extends typeof EMAIL_TEMPLATES.COMPLAINT_CREATED
  ? ComplaintCreatedEmailData
  : T extends typeof EMAIL_TEMPLATES.COMPLAINT_ASSIGNED
  ? ComplaintAssignedEmailData
  : T extends typeof EMAIL_TEMPLATES.COMPLAINT_STATUS_UPDATED
  ? ComplaintStatusUpdatedEmailData
  : T extends typeof EMAIL_TEMPLATES.COMPLAINT_COMMENTED
  ? ComplaintCommentedEmailData
  : T extends typeof EMAIL_TEMPLATES.COMPLAINT_RESOLVED
  ? ComplaintResolvedEmailData
  : T extends typeof EMAIL_TEMPLATES.COMPLAINT_ESCALATED
  ? ComplaintEscalatedEmailData
  : T extends typeof EMAIL_TEMPLATES.SLA_WARNING
  ? SLAWarningEmailData
  : T extends typeof EMAIL_TEMPLATES.SLA_EXCEEDED
  ? SLAExceededEmailData
  : T extends typeof EMAIL_TEMPLATES.WEEKLY_REPORT
  ? WeeklyReportEmailData
  : T extends typeof EMAIL_TEMPLATES.MONTHLY_REPORT
  ? MonthlyReportEmailData
  : Record<string, unknown>;
};

/**
 * Email Send Result
 * نتيجة إرسال البريد
 */
export interface EmailSendResult {
  success: boolean;
  logId?: string;
  messageId?: string;
  error?: string;
}

/**
 * Email Queue Item
 * عنصر في طابور البريد
 */
export interface EmailQueueItem extends BaseEmail {
  id: string;
  template: EmailTemplate;
  templateData: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  status: EmailStatus;
  createdAt: Date;
  scheduledAt?: Date;
}
