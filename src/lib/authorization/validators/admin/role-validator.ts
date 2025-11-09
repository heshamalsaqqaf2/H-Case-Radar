// src/lib/validators/role-validator.ts
import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Name can only contain letters, numbers and underscores"),
  description: z.string().min(10).max(100),
  isDefault: z.boolean().default(false),
});

export const updateRoleSchema = createRoleSchema.extend({
  id: z.string().uuid(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
