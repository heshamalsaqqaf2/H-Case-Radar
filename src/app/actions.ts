"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function completeSetup() {
  const cookieStore = await cookies();
  cookieStore.set("app-setup-complete", "true", {
    maxAge: 60 * 60 * 24 * 365, // سنة واحدة
    path: "/",
  });
  console.log("Setup completion cookie set on server.");

  // إعادة التوجيه إلى نفس الصفحة لإعادة تحميلها بدون شاشة الإعداد
  redirect("/");
}
