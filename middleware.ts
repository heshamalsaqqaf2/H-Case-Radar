import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/authentication/auth-server";
import { authorizationService } from "@/lib/authentication/permission-system";

export async function middleware(request: NextRequest) {
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
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
