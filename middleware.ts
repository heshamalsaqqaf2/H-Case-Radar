import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/Authentication/auth-server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // !Start of the authentication process
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.redirect(new URL("/sign-in", request.url));
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const authorizationService = (
      await import("@/lib/Authentication/permission-system")
    ).authorizationService;
    const hasAdminAccess = await authorizationService.checkPermission(
      { userId: session.user.id },
      "admin.access",
    );
    if (!hasAdminAccess.allowed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // !Start of the setup process Direction of the App
  // ابحث عن كوكيز خاص بالإعداد
  const setupCookie = request.cookies.get("app-setup-complete");
  // ابحث عن كوكيز الاتجاه
  const directionCookie = request.cookies.get("direction");
  // إذا لم يكن هناك كوكيز اتجاه، فهذه هي الزيارة الأولى على الإطلاق
  if (!directionCookie) {
    console.log("First visit ever. Setting direction and setup cookie.");
    const acceptLanguage = request.headers.get("accept-language") || "";
    const langCode = acceptLanguage.split(",")[0].split("-")[0];
    const rtlLanguages = ["ar", "he", "fa", "ur", "ku", "ps"];
    const direction = rtlLanguages.includes(langCode) ? "rtl" : "ltr";
    // تعيين الكوكيز لمدة عام
    response.cookies.set("direction", direction, {
      maxAge: 60 * 60 * 24 * 365,
    });
    // أرسل إشارة إلى الـ Layout بأن هذه هي الزيارة الأولى
    response.headers.set("x-is-first-visit", "true");
    response.headers.set("x-direction", direction);
  } else {
    // إذا كان كوكيز الاتجاه موجوداً، فهو زار من قبل
    console.log("Returning user. Sending saved direction.");
    response.headers.set("x-direction", directionCookie.value);
    // إذا لم يكن هناك كوكيز إعداد، فهذا يعني أنه زار من قبل لكنه لم يكمل الإعداد (سيناريو نادر)
    // في هذه الحالة، نعرض شاشة الإعداد مرة أخرى
    if (!setupCookie) {
      console.log(
        "User visited before but didn't complete setup. Showing setup screen again.",
      );
      response.headers.set("x-is-first-visit", "true");
    }
  }
  return response;
  // return NextResponse.next();
}

// Define the matcher for the middleware
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
