import { z } from "zod";

const statusEnum = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "unresolved",
  "escalated",
  "on_hold",
  "reopened",
] as const;
const priorityEnum = ["low", "medium", "high", "critical"] as const;
const sourceEnum = ["web_form", "email", "phone", "mobile_app", "api"] as const;
const escalationEnum = ["none", "level_1", "level_2", "level_3"] as const;
const satisfactionEnum = [
  "very_dissatisfied",
  "dissatisfied",
  "neutral",
  "satisfied",
  "very_satisfied",
] as const;

export const createComplaintSchema = z
  .object({
    title: z.string().min(5, "يجب أن يحتوي العنوان على 5 أحرف على الأقل").max(100),
    description: z.string().min(10, "يجب أن تحتوي الوصف على 10 أحرف على الأقل"),
    category: z.string().min(1, "التصنيف مطلوب"),
    priority: z.enum(priorityEnum, "الأولوية مطلوبة").default("medium"),
    source: z.enum(sourceEnum).optional().default("web_form"),
    tags: z.array(z.string()).optional().default([]),
    attachments: z.array(z.string()).optional().default([]),
    assignedTo: z.string().min(1, "يجب تعيين مستخدم للشكوى"),
    escalationLevel: z.enum(escalationEnum).optional().default("none"),
    responseDueAt: z.date().optional(),
    expectedResolutionDate: z.date().optional(),
    isUrgent: z.boolean().optional().default(false),
  })
  .strict();

export const updateComplaintSchema = z
  .object({
    id: z.string().uuid("معرّف الشكوى غير صحيح"),
    title: z.string().min(5, "يجب أن يحتوي العنوان على 5 أحرف على الأقل").max(100).optional(),
    description: z.string().min(10, "يجب أن تحتوي الوصف على 10 أحرف على الأقل").optional(),
    status: z.enum(statusEnum).optional(),
    priority: z.enum(priorityEnum).optional(),
    category: z.string().min(1, "التصنيف مطلوب").optional(),
    assignedTo: z.string().min(1, "يجب تعيين مستخدم للشكوى").optional(), // ✅ مطلوب إذا تم التعيين
    resolutionNotes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    escalationLevel: z.enum(escalationEnum).optional(),
    satisfactionRating: z.enum(satisfactionEnum).optional(),
    responseDueAt: z.date().optional(),
    expectedResolutionDate: z.date().optional(),
    isUrgent: z.boolean().optional(),
    reopenReason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // ✅ التحقق من ملاحظات الحل فقط عند الحالة resolved
    if (data.status === "resolved" && (!data.resolutionNotes || data.resolutionNotes.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عند تغيير الحالة إلى 'resolved' يجب تزويد ملاحظات الحل",
      });
    }

    // ✅ التحقق من سبب إعادة الفتح عند الحالة reopened
    if (data.status === "reopened" && (!data.reopenReason || data.reopenReason.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عند إعادة فتح الشكوى يجب تزويد سبب إعادة الفتح",
      });
    }

    // ✅ التحقق من التاريخ
    if (data.responseDueAt && data.responseDueAt < new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "لا يمكن أن يكون موعد التسليم في الماضي",
      });
    }
  });

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
