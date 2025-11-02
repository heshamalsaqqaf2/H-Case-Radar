// src/lib/authorization/validators/admin/permission-validator.ts
import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "يجب أن يحتوي الاسم على أحرف، أرقام، أو _.- فقط",
    ),
  description: z.string().max(200).optional(),
  resource: z.string().min(1, "الموارد مطلوبة"),
  action: z.string().min(1, "الإجراء مطلوب"),
  conditions: z.string().optional(), // JSON string
});

export const updatePermissionSchema = createPermissionSchema.extend({
  id: z.string().uuid("معرف الصلاحية غير صالح"),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
