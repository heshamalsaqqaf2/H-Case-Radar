// src/lib/authentication/sign-out-action.ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../auth-server";

/**
 * Server Action لتسجيل خروج المستخدم بأمان.
 * يُنهي جلسة Better Auth ويُعيد توجيه المستخدم إلى صفحة تسجيل الدخول.
 */
export async function signOutAction(): Promise<void> {
  try {
    await auth.api.signOut({ headers: await headers() });
    redirect("/sign-in");
  } catch (error) {
    console.error("Error during sign out:", error);
    // حتى لو فشل الإنهاء، نُعيد التوجيه لضمان خروج المستخدم من الواجهة
    redirect("/sign-in");
  }
}
