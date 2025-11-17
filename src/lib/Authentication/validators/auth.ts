import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  rememberMe: z.boolean().optional(),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(50, "الاسم يجب أن لا يتجاوز 50 حرف"),
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة").min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  image: z.string().url("رابط الصورة غير صالح").optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "كلمة المرور القديمة مطلوبة"),
  newPassword: z
    .string()
    .min(1, "كلمة المرور الجديدة مطلوبة")
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z
    .string()
    .min(1, "تاكيد كلمة المرور مطلوب")
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
