// src/lib/complaints/validators/complaint-validator.ts
import { z } from "zod";

const statusEnum = ["open", "in_progress", "awaiting_response", "resolved", "closed"] as const;
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

export const createComplaintSchema = z.object({
  title: z.string().min(5, "يجب أن يحتوي العنوان على 5 أحرف على الأقل").max(255),
  description: z.string().min(10, "يجب أن تحتوي الوصف على 10 أحرف على الأقل"),
  category: z.string().min(1, "التصنيف مطلوب"),
  priority: z.enum(priorityEnum, {
    errorMap: () => ({
      code: "custom",
      message: "الاولوية غير صحيحة",
    }),
  }),
  source: z.enum(sourceEnum).optional().default("web_form"),
  tags: z.array(z.string()).optional().default([]),
  attachments: z.array(z.string()).optional().default([]),
  assignedTo: z.string().uuid("معرف المستخدم غير صالح").optional(),
});

export const updateComplaintSchema = z.object({
  id: z.string().uuid("معرّف الشكوى غير صحيح"),
  title: z.string().min(5, "يجب أن يحتوي العنوان على 5 أحرف على الأقل").max(255).optional(),
  description: z.string().min(10, "يجب أن تحتوي الوصف على 10 أحرف على الأقل").optional(),
  status: z.enum(statusEnum).optional(),
  priority: z.enum(priorityEnum).optional(),
  category: z.string().min(1, "التصنيف مطلوب").optional(),
  assignedTo: z.string().uuid("معرف المستخدم غير صالح").optional(),
  resolutionNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  escalationLevel: z.enum(escalationEnum).optional(),
  satisfactionRating: z.enum(satisfactionEnum).optional(),
  responseDueAt: z.coerce.date().optional(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
