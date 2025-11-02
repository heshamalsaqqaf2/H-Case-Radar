// lib/authentication/session.ts
"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { auth } from "./auth-server";

/**
 * يُعيد معرّف المستخدم الحالي من الجلسة.
 * @throws APIError إذا لم يكن هناك جلسة نشطة.
 */
export async function getCurrentUserId(): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new APIError("UNAUTHORIZED", {
        message: "You Are Not Signed In, Please Sign In First.",
        cause: "not_logged_in",
        code: "401",
      });
    }
    return session.user.id;
  } catch (error) {
    // إذا كان الخطأ من Better Auth، أعد رميه كما هو
    if (error instanceof APIError) {
      throw error;
    }
    // أي خطأ آخر (شبكة، خادم، إلخ)
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Something Went Wrong, Please Try Again Later.",
      cause: "session_fetch_failed",
      code: "500",
    });
  }
}
