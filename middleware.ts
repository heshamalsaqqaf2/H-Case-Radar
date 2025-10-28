import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/authentication/auth-server";
import { authorizationService } from "@/lib/authentication/permission-system";

export async function middleware(request: NextRequest) {
  // !Continue the request as usual
  const response = NextResponse.next();

  // !Start of the authentication process
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) return NextResponse.redirect(new URL("/sign-in", request.url));

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const hasAdminAccess = await authorizationService.checkPermission(
      { userId: session.user.id },
      "admin.access",
    );
    if (!hasAdminAccess.allowed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // !Start of the setup process Direction of the App
  // Search for the "app-setup-complete" cookie in the request
  const setupCookie = request.cookies.get("app-setup-complete");
  const directionCookie = request.cookies.get("direction");

  if (!directionCookie) {
    console.log("First visit ever. Setting direction and setup cookie.");
    const acceptLanguage = request.headers.get("accept-language") || "";
    const langCode = acceptLanguage.split(",")[0].split("-")[0];
    const rtlLanguages = ["ar", "he", "fa", "ur", "ku", "ps"];
    const direction = rtlLanguages.includes(langCode) ? "rtl" : "ltr";

    // Set the cookie 1 year in the future
    response.cookies.set("direction", direction, {
      maxAge: 5 * 1000, // 5 seconds
    });

    // Set the "x-is-first-visit" header
    response.headers.set("x-is-first-visit", "true");
    response.headers.set("x-direction", direction);
  } else {
    // User has visited before and has a direction cookie
    console.log("Returning user. Sending saved direction.");
    response.headers.set("x-direction", directionCookie.value);
    if (!setupCookie) {
      console.log(
        "User visited before but didn't complete setup. Showing setup screen again.",
      );
      response.headers.set("x-is-first-visit", "true");
    }
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
