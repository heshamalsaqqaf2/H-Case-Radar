import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/Authentication/auth-server";
import { authorizationService } from "@/lib/Authentication/permission-system";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // إذا لم يكن المستخدم مسجلاً الدخول، إعادة التوجيه للصفحة الرئيسية
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // التحقق من الصلاحيات للمسارات الإدارية
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // const authorizationService = (
    //   await import("@/lib/Authentication/permission-system")
    // ).authorizationService;

    const hasAdminAccess = await authorizationService.checkPermission(
      { userId: session.user.id },
      "admin.access",
    );

    if (!hasAdminAccess.allowed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
