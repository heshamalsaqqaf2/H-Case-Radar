// lib/actions/auth-actions.ts
"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/lib/authentication/auth-server";
import {
  authorizationService,
  type SafePermission,
} from "@/lib/authentication/permission-system";

export async function getCurrentUser() {
  try {
    const headersList = await headers();
    const cookieStore = await cookies();
    const cookieString = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieString,
        ...Object.fromEntries(headersList.entries()),
      }),
    });

    return session?.user || null;
  } catch (error) {
    console.error("❌ Error in getCurrentUser:", error);
    return null;
  }
}

export async function getUserPermissions(
  userId: string,
): Promise<SafePermission[]> {
  try {
    if (!userId) {
      console.warn("getUserPermissions called with empty userId");
      return [];
    }
    return await authorizationService.getUserPermissions(userId);
  } catch (error) {
    console.error("❌ Error getting user permissions:", error);
    return [];
  }
}

// // lib/actions/auth-actions.ts
// "use server";

// import { cookies, headers } from "next/headers";
// import { auth } from "@/lib/authentication/auth-server";
// import { authorizationService } from "@/lib/authentication/permission-system";

// export async function getCurrentUser() {
//   try {
//     console.log("🔍 getCurrentUser called");

//     const headersList = await headers();
//     const cookieStore = await cookies();

//     const cookieString = cookieStore
//       .getAll()
//       .map((cookie) => `${cookie.name}=${cookie.value}`)
//       .join("; ");

//     console.log("📋 Cookies found:", cookieStore.getAll().length);

//     const session = await auth.api.getSession({
//       headers: new Headers({
//         cookie: cookieString,
//         ...Object.fromEntries(headersList.entries()),
//       }),
//     });

//     console.log("🎯 Session result:", {
//       hasSession: !!session,
//       hasUser: !!session?.user,
//       user: session?.user
//         ? {
//             id: session.user.id,
//             email: session.user.email,
//             name: session.user.name,
//           }
//         : null,
//     });

//     return session?.user || null;
//   } catch (error) {
//     console.error("❌ Error in getCurrentUser:", error);
//     return null;
//   }
// }

// export async function getUserPermissions(userId: string) {
//   try {
//     if (!userId) {
//       console.warn("getUserPermissions called with empty userId");
//       return [];
//     }

//     console.log("🔍 getUserPermissions called for user:", userId);
//     const permissions = await authorizationService.getUserPermissions(userId);
//     console.log("📋 Permissions found:", permissions.length);
//     return permissions;
//   } catch (error) {
//     console.error("❌ Error getting user permissions:", error);
//     return [];
//   }
// }
