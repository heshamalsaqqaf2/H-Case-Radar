// src/lib/authorization/validators/admin/user-validator.ts
import { z } from "zod";

export const assignRoleSchema = z.object({
  userId: z.string().uuid("معرف المستخدم غير صالح"),
  roleId: z.string().uuid("معرف الدور غير صالح"),
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
