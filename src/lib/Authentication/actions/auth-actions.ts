// actions/auth-actions.ts
"use server";

import { redirect } from "next/navigation";
import { getCurrentSession, signIn, signOut } from "@/lib/authentication/services/auth-service";

// Action Types
interface SignInActionResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Actions
export async function signInAction(prevState: any, formData: FormData): Promise<SignInActionResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        message: "البريد الإلكتروني وكلمة المرور مطلوبين",
      };
    }

    const credentials = { email, password };
    const result = await signIn(credentials);

    if (result.success && result.user) {
      const userStatus = result.user.accountStatus || "pending";
      if (userStatus === "accepted") {
        redirect("/account-accepted");
      } else if (userStatus === "pending") {
        redirect("/auth/waiting-approval");
      } else if (userStatus === "rejected") {
        redirect("/auth/account-rejected");
      } else {
        redirect("/");
      }

      //switch (userStatus) {
      //   case "accepted":
      //     redirect("/account-accepted");
      //   case "pending":
      //     redirect("/auth/waiting-approval");
      //   case "rejected":
      //     redirect("/auth/account-rejected");
      //   default:
      //     redirect("/");
      // }
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
      error: error instanceof Error ? error.message : "خطأ غير معروف",
    };
  }
}

export async function checkUserSession() {
  try {
    const session = await getCurrentSession();
    return session;
  } catch (error) {
    console.error("Error checking session:", error);
    return null;
  }
}

export async function signOutAction() {
  try {
    const result = await signOut();
    if (result.success) {
      redirect("/sign-in");
    }
    return result;
  } catch (error) {
    console.error("Error in sign out action:", error);
    return { success: false, message: "Failed to sign out." };
  }
}
