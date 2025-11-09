import { z } from "zod";

export const createComplaintSchema = z.object({
  title: z
    .string()
    .min(3, "العنوان يجب أن يحتوي على 3 أحرف على الأقل")
    .max(255, "العنوان يجب ألا يتجاوز 255 حرفًا"),
  description: z.string().min(10, "الوصف يجب أن يحتوي على 10 أحرف على الأقل"),
  category: z.string().min(1, "التصنيف مطلوب"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  source: z
    .enum(["web_form", "email", "phone", "mobile_app", "api"])
    .default("web_form"),
  tags: z.string().array().optional().default([]),
  escalationLevel: z
    .enum(["none", "level_1", "level_2", "level_3"])
    .default("none"),
  responseDueAt: z.coerce.date().optional(),
});

export const updateComplaintSchema = createComplaintSchema.extend({
  id: z.string().uuid("معرف الشكوى غير صالح"),
  status: z
    .enum(["open", "in_progress", "awaiting_response", "resolved", "closed"])
    .optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  resolutionNotes: z.string().optional(),
  satisfactionRating: z
    .enum([
      "very_dissatisfied",
      "dissatisfied",
      "neutral",
      "satisfied",
      "very_satisfied",
    ])
    .optional(),
});

export const assignComplaintSchema = z.object({
  complaintId: z.string().uuid("معرف الشكوى غير صالح"),
  userId: z.string().uuid("معرف المستخدم غير صالح"),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
