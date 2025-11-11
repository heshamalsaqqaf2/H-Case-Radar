// src/lib/authorization/validators/admin/user-validator.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  email: z.string().email("البريد الإلكتروني النظامي غير صحيح"), // ✅ النظامي
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  roleIds: z.array(z.string()).min(1, "يجب اختيار دور واحد على الأقل"),
  sendWelcomeEmail: z.boolean().default(true),
  // personalEmail: z.string().email("البريد الإلكتروني الشخصي غير صحيح"), // ✅ الشخصي
});
// .refine((data) => data.email !== data.personalEmail, {
//   message: "البريد الإلكتروني النظامي والشخصي يجب أن يكونا مختلفين",
//   path: ["personalEmail"],
// });

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

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ToggleBanInput = z.infer<typeof toggleBanSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
