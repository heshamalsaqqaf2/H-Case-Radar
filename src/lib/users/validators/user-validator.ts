import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
  image: z.string().url("رابط الصورة غير صالح").optional().nullable(),
  personalEmail: z.string().email("البريد الإلكتروني غير صالح").optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
