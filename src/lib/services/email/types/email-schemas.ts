import { z } from "zod";
import { EMAIL_TEMPLATES } from "./email-types";


/**
 * Zod Schemas للتحقق من بيانات البريد الإلكتروني
 */

// Email Address Schema
const emailAddressSchema = z.string().email("عنوان بريد إلكتروني غير صحيح");

// Base Email Schema
export const baseEmailSchema = z.object({
  to: z.union([emailAddressSchema, z.array(emailAddressSchema)]),
  cc: z.union([emailAddressSchema, z.array(emailAddressSchema)]).optional(),
  bcc: z.union([emailAddressSchema, z.array(emailAddressSchema)]).optional(),
  subject: z.string().min(1, "الموضوع مطلوب").max(200, "الموضوع طويل جداً"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  scheduledAt: z.date().optional(),
  userId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});



// Template Data Schemas

// Authentication Templates
export const credentialsEmailDataSchema = z.object({
  userName: z.string().min(1),
  email: emailAddressSchema,
  password: z.string().min(1),
  loginUrl: z.string().url(),
});

export const welcomeEmailDataSchema = z.object({
  userName: z.string().min(1),
  dashboardUrl: z.string().url(),
});

export const passwordResetEmailDataSchema = z.object({
  userName: z.string().min(1),
  resetUrl: z.string().url(),
  expiresIn: z.string(),
});

export const emailVerificationDataSchema = z.object({
  userName: z.string().min(1),
  verificationUrl: z.string().url(),
  expiresIn: z.string(),
});

export const accountStatusEmailDataSchema = z.object({
  userName: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
  loginUrl: z.string().url().optional(),
});

// Complaint Templates
export const complaintCreatedEmailDataSchema = z.object({
  userName: z.string().min(1),
  complaintId: z.string().uuid(),
  complaintTitle: z.string().min(1),
  category: z.string(),
  priority: z.string(),
  complaintUrl: z.string().url(),
});

export const complaintAssignedEmailDataSchema = z.object({
  userName: z.string().min(1),
  complaintId: z.string().uuid(),
  complaintTitle: z.string().min(1),
  category: z.string(),
  priority: z.string(),
  assignedBy: z.string(),
  dueDate: z.string().optional(),
  complaintUrl: z.string().url(),
});

export const complaintStatusUpdatedEmailDataSchema = z.object({
  userName: z.string().min(1),
  complaintId: z.string().uuid(),
  complaintTitle: z.string().min(1),
  oldStatus: z.string(),
  newStatus: z.string(),
  updatedBy: z.string(),
  complaintUrl: z.string().url(),
});

export const complaintCommentedEmailDataSchema = z.object({
  userName: z.string().min(1),
  complaintId: z.string().uuid(),
  complaintTitle: z.string().min(1),
  commenterName: z.string(),
  commentPreview: z.string().max(200),
  complaintUrl: z.string().url(),
});

export const complaintResolvedEmailDataSchema = z.object({
  userName: z.string().min(1),
  complaintId: z.string().uuid(),
  complaintTitle: z.string().min(1),
  resolvedBy: z.string(),
  resolutionNotes: z.string(),
  resolutionTime: z.string(),
  complaintUrl: z.string().url(),
});

export const complaintEscalatedEmailDataSchema = z.object({
  managerName: z.string().min(1),
  complaintId: z.string().uuid(),
  complaintTitle: z.string().min(1),
  priority: z.string(),
  escalationReason: z.string(),
  assignedTo: z.string(),
  dueDate: z.string(),
  complaintUrl: z.string().url(),
});

export const slaWarningEmailDataSchema = z.object({
  userName: z.string().min(1),
  complaintId: z.string().uuid(),
  complaintTitle: z.string().min(1),
  priority: z.string(),
  remainingTime: z.string(),
  dueDate: z.string(),
  complaintUrl: z.string().url(),
});

export const slaExceededEmailDataSchema = z.object({
  managerName: z.string().min(1),
  complaintId: z.string().uuid(),
  complaintTitle: z.string().min(1),
  priority: z.string(),
  assignedTo: z.string(),
  exceededBy: z.string(),
  complaintUrl: z.string().url(),
});

// Report Templates
export const weeklyReportEmailDataSchema = z.object({
  userName: z.string().min(1),
  weekRange: z.string(),
  totalComplaints: z.number().int().nonnegative(),
  resolvedComplaints: z.number().int().nonnegative(),
  pendingComplaints: z.number().int().nonnegative(),
  averageResolutionTime: z.string(),
  reportUrl: z.string().url(),
});

export const monthlyReportEmailDataSchema = z.object({
  userName: z.string().min(1),
  month: z.string(),
  totalComplaints: z.number().int().nonnegative(),
  resolvedComplaints: z.number().int().nonnegative(),
  pendingComplaints: z.number().int().nonnegative(),
  averageResolutionTime: z.string(),
  topCategories: z.array(
    z.object({
      category: z.string(),
      count: z.number().int().nonnegative(),
    })
  ),
  reportUrl: z.string().url(),
});

// Email Log Schema
export const emailLogCreateSchema = z.object({
  to: z.string(),
  from: z.string(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string(),
  template: z.string(),
  templateData: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["pending", "queued", "sent", "failed"]).default("pending"),
  errorMessage: z.string().optional(),
  attempts: z.number().int().nonnegative().default(0),
  maxAttempts: z.number().int().positive().default(3),
  scheduledAt: z.date().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  userId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});



/**
 * Template-specific schemas
 * دمج البريد الأساسي مع بيانات القالب المحددة
 */
export const createEmailSchemaMap = {
  [EMAIL_TEMPLATES.CREDENTIALS]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.CREDENTIALS),
    templateData: credentialsEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.WELCOME]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.WELCOME),
    templateData: welcomeEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.PASSWORD_RESET]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.PASSWORD_RESET),
    templateData: passwordResetEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.EMAIL_VERIFICATION]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.EMAIL_VERIFICATION),
    templateData: emailVerificationDataSchema,
  }),
  [EMAIL_TEMPLATES.ACCOUNT_APPROVED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.ACCOUNT_APPROVED),
    templateData: accountStatusEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.ACCOUNT_REJECTED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.ACCOUNT_REJECTED),
    templateData: accountStatusEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.COMPLAINT_CREATED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.COMPLAINT_CREATED),
    templateData: complaintCreatedEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.COMPLAINT_ASSIGNED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.COMPLAINT_ASSIGNED),
    templateData: complaintAssignedEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.COMPLAINT_STATUS_UPDATED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.COMPLAINT_STATUS_UPDATED),
    templateData: complaintStatusUpdatedEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.COMPLAINT_COMMENTED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.COMPLAINT_COMMENTED),
    templateData: complaintCommentedEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.COMPLAINT_RESOLVED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.COMPLAINT_RESOLVED),
    templateData: complaintResolvedEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.COMPLAINT_ESCALATED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.COMPLAINT_ESCALATED),
    templateData: complaintEscalatedEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.SLA_WARNING]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.SLA_WARNING),
    templateData: slaWarningEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.SLA_EXCEEDED]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.SLA_EXCEEDED),
    templateData: slaExceededEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.WEEKLY_REPORT]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.WEEKLY_REPORT),
    templateData: weeklyReportEmailDataSchema,
  }),
  [EMAIL_TEMPLATES.MONTHLY_REPORT]: baseEmailSchema.extend({
    template: z.literal(EMAIL_TEMPLATES.MONTHLY_REPORT),
    templateData: monthlyReportEmailDataSchema,
  }),
} as const;

// Generic Email Send Schema
export const sendEmailSchema = z.union([
  createEmailSchemaMap[EMAIL_TEMPLATES.CREDENTIALS],
  createEmailSchemaMap[EMAIL_TEMPLATES.WELCOME],
  createEmailSchemaMap[EMAIL_TEMPLATES.PASSWORD_RESET],
  createEmailSchemaMap[EMAIL_TEMPLATES.EMAIL_VERIFICATION],
  createEmailSchemaMap[EMAIL_TEMPLATES.ACCOUNT_APPROVED],
  createEmailSchemaMap[EMAIL_TEMPLATES.ACCOUNT_REJECTED],
  createEmailSchemaMap[EMAIL_TEMPLATES.COMPLAINT_CREATED],
  createEmailSchemaMap[EMAIL_TEMPLATES.COMPLAINT_ASSIGNED],
  createEmailSchemaMap[EMAIL_TEMPLATES.COMPLAINT_STATUS_UPDATED],
  createEmailSchemaMap[EMAIL_TEMPLATES.COMPLAINT_COMMENTED],
  createEmailSchemaMap[EMAIL_TEMPLATES.COMPLAINT_RESOLVED],
  createEmailSchemaMap[EMAIL_TEMPLATES.COMPLAINT_ESCALATED],
  createEmailSchemaMap[EMAIL_TEMPLATES.SLA_WARNING],
  createEmailSchemaMap[EMAIL_TEMPLATES.SLA_EXCEEDED],
  createEmailSchemaMap[EMAIL_TEMPLATES.WEEKLY_REPORT],
  createEmailSchemaMap[EMAIL_TEMPLATES.MONTHLY_REPORT],
]);

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
