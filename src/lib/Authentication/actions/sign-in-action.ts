// src/lib/authorization/actions/auth-actions.ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/authentication/auth-server";
import { signInSchema } from "@/lib/authentication/validators/sign-in-validator";
import { logFailedLogin } from "@/lib/authorization/services/admin/audit-log-service";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import type { ErrorCode } from "@/lib/errors/error-types";

export async function signInAction({
  formData,
}: {
  formData: FormData;
}): Promise<{ success: false; error: { code: ErrorCode; message: string } }> {
  // التحقق من بيانات الاعتماد
  const validatedData = signInSchema.parse({
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
  });

  const { email, password } = validatedData;
  if (!email || !password) {
    return handleFailure({ error: "بيانات الاعتماد غير صحيحة" });
  }

  if (email.trim().length === 0 || password.trim().length === 0) {
    return handleFailure({ error: "الحقول مطلوبة, يرجى إدخال بيانات صحيحة" });
  }

  try {
    const data = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: true,
      },
      headers: await headers(),
    });
    if (data) {
      //  تسجيل الدخول بنجاح — تسجيل الحدث
      handleSuccess({ message: "تم تسجيل الدخول بنجاح" });
      redirect("/");
    } else {
      //  فشل التسجيل — تسجيل الحدث
      await logFailedLogin(email);
      return handleFailure({ error: "بيانات الاعتماد غير صحيحة" });
    }
  } catch (error) {
    //  طأ في التسجيل — تسجيل الحدث
    await logFailedLogin(email);
    return handleFailure(error);
  }
}
