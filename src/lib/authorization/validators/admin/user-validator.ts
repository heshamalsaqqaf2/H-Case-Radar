// src/lib/authorization/validators/admin/user-validator.ts
import { z } from "zod";

export const assignRoleSchema = z.object({
  userId: z.string().uuid("معرف المستخدم غير صالح"),
  roleId: z.string().uuid("معرف الدور غير صالح"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").optional(),
  email: z.string().email("بريد إلكتروني غير صحيح").optional(),
  banned: z.boolean().nullable().optional(),
  banReason: z.string().nullable().optional(),
});

export const toggleBanSchema = z.object({
  targetUserId: z.string().min(1, "معرف المستخدم مطلوب"),
  ban: z.boolean(),
  reason: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ToggleBanInput = z.infer<typeof toggleBanSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
