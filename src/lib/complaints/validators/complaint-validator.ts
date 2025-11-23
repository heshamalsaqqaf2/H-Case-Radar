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
    assignedTo: z.string().optional().default(""),
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
    assignedTo: z.string().optional().nullable(),
    resolutionNotes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    escalationLevel: z.enum(escalationEnum).optional(),
    satisfactionRating: z.enum(satisfactionEnum).optional(),
    responseDueAt: z.date().optional().nullable(),
    expectedResolutionDate: z.date().optional().nullable(),
    isUrgent: z.boolean().optional(),
    reopenReason: z.string().optional(),
    attachments: z.array(z.string()).optional(),
    source: z.enum(sourceEnum).optional(),
  }).strip()
  .refine(
    (data) => {
      // التحقق من ملاحظات الحل فقط عند تغيير الحالة إلى resolved
      if (data.status === "resolved") {
        return !!(data.resolutionNotes && data.resolutionNotes.trim() !== "");
      }
      return true;
    },
    {
      message: "عند تغيير الحالة إلى 'محلولة' يجب تزويد ملاحظات الحل",
      path: ["resolutionNotes"],
    }
  )
  .refine(
    (data) => {
      // التحقق من سبب إعادة الفتح فقط عند تغيير الحالة إلى reopened
      if (data.status === "reopened") {
        return !!(data.reopenReason && data.reopenReason.trim() !== "");
      }
      return true;
    },
    {
      message: "عند إعادة فتح الشكوى يجب تزويد سبب إعادة الفتح",
      path: ["reopenReason"],
    }
  )
  .refine(
    (data) => {
      // منع إرسال resolutionNotes إذا لم تكن الحالة resolved
      if (data.resolutionNotes && data.status !== "resolved") {
        return false;
      }
      return true;
    },
    {
      message: "يمكن إضافة ملاحظات الحل فقط عند تغيير الحالة إلى 'محلولة'",
      path: ["resolutionNotes"],
    }
  )
  .refine(
    (data) => {
      // منع إرسال reopenReason إذا لم تكن الحالة reopened
      if (data.reopenReason && data.status !== "reopened") {
        return false;
      }
      return true;
    },
    {
      message: "يمكن إضافة سبب إعادة الفتح فقط عند تغيير الحالة إلى 'معاد فتحها'",
      path: ["reopenReason"],
    }
  )
  .refine(
    (data) => {
      // التحقق من تاريخ الاستجابة
      if (data.responseDueAt) {
        return data.responseDueAt >= new Date();
      }
      return true;
    },
    {
      message: "لا يمكن أن يكون موعد الاستجابة في الماضي",
      path: ["responseDueAt"],
    }
  )
  .refine(
    (data) => {
      // التحقق من تاريخ الحل المتوقع
      if (data.expectedResolutionDate) {
        return data.expectedResolutionDate >= new Date();
      }
      return true;
    },
    {
      message: "لا يمكن أن يكون موعد الحل المتوقع في الماضي",
      path: ["expectedResolutionDate"],
    }
  );

// export const updateComplaintSchema = z
//   .object({
//     id: z.string().uuid("معرّف الشكوى غير صحيح"),
//     title: z.string().min(5, "يجب أن يحتوي العنوان على 5 أحرف على الأقل").max(100).optional(),
//     description: z.string().min(10, "يجب أن تحتوي الوصف على 10 أحرف على الأقل").optional(),
//     status: z.enum(statusEnum).optional(),
//     priority: z.enum(priorityEnum).optional(),
//     category: z.string().min(1, "التصنيف مطلوب").optional(),
//     assignedTo: z.string().optional(),
//     resolutionNotes: z.string().optional(),
//     tags: z.array(z.string()).optional(),
//     escalationLevel: z.enum(escalationEnum).optional(),
//     satisfactionRating: z.enum(satisfactionEnum).optional(),
//     responseDueAt: z.date().optional(),
//     expectedResolutionDate: z.date().optional(),
//     isUrgent: z.boolean().optional(),
//     reopenReason: z.string().optional(),
//     attachments: z.array(z.string()).optional(),
//     source: z.enum(sourceEnum).optional(),
//   })
//   .superRefine((data, ctx) => {
//     // ✅ التحقق من ملاحظات الحل فقط عند الحالة resolved
//     if (data.status === "resolved" && (!data.resolutionNotes || data.resolutionNotes.trim() === "")) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "عند تغيير الحالة إلى 'resolved' يجب تزويد ملاحظات الحل",
//       });
//     }

//     // ✅ التحقق من سبب إعادة الفتح عند الحالة reopened
//     if (data.status === "reopened" && (!data.reopenReason || data.reopenReason.trim() === "")) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "عند إعادة فتح الشكوى يجب تزويد سبب إعادة الفتح",
//       });
//     }

//     // ✅ التحقق من التاريخ
//     if (data.responseDueAt && data.responseDueAt < new Date()) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "لا يمكن أن يكون موعد التسليم في الماضي",
//       });
//     }
//   });

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
