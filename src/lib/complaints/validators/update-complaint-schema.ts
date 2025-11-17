// src/lib/complaints/validators/update-complaint-schema.ts
import { z } from "zod";
import { ComplaintStatus } from "../state/complaint-status";

export const updateComplaintSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(5).max(255).optional(),
    description: z.string().min(10).optional(),
    status: z.enum(Object.values(ComplaintStatus) as [string, ...string[]]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"] as const).optional(),
    category: z.string().min(1).optional(),
    assignedTo: z.string().uuid().optional(),
    resolutionNotes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    escalationLevel: z.enum(["none", "level_1", "level_2", "level_3"] as const).optional(),
    satisfactionRating: z
      .enum(["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"] as const)
      .optional(),
    responseDueAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    // إذا وضع المستخدم status = resolved فتأكد من وجود resolutionNotes
    if (data.status === "resolved" && (!data.resolutionNotes || data.resolutionNotes.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "عند تغيير الحالة إلى 'resolved' يجب تزويد حقول resolutionNotes",
      });
    }
    // لاحقاً: يمكن إضافة تحقق canTransition هنا إذا أردت معرفة الحالة الحالية (يحتاج لتمرير الحالة الحالية)
  });
