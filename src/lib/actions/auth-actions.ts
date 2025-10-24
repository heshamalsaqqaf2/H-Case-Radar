"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/lib/Authentication/auth-server";

export async function getCurrentUser() {
  try {
    console.log("🔍 getCurrentUser called");

    const headersList = await headers();
    const cookieStore = await cookies();

    // الحصول على الـ cookies كـ string
    const cookieString = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    console.log("📋 Cookies found:", cookieStore.getAll().length);

    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieString,
        ...Object.fromEntries(headersList.entries()),
      }),
    });

    console.log("🎯 Session result:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
          }
        : null,
    });

    return session?.user || null;
  } catch (error) {
    console.error("❌ Error in getCurrentUser:", error);
    return null;
  }
}

export async function getUserPermissions(userId: string) {
  try {
    console.log("🔍 getUserPermissions called for user:", userId);

    const { authorizationService } = await import(
      "@/lib/Authentication/permission-system"
    );
    const permissions = await authorizationService.getUserPermissions(userId);

    console.log("📋 Permissions found:", permissions.length);

    return permissions;
  } catch (error) {
    console.error("❌ Error getting user permissions:", error);
    return [];
  }
}
