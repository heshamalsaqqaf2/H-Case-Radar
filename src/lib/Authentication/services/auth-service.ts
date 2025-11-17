// services/auth-service.ts
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/authentication/auth-server";
import { user } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";

// Types
interface SignInCredentials {
  email: string;
  password: string;
}

interface SignInResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    accountStatus: string;
  };
}

interface SessionData {
  user: {
    id: string;
    email: string;
    accountStatus: string;
  };
}

// Service Functions
export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) {
    redirect("/sign-in");
  }

  return {
    ...session,
    currentUser,
  };
};

export const signIn = async (credentials: SignInCredentials): Promise<SignInResponse> => {
  try {
    await auth.api.signInEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    });

    // After sign in, get the session to return user data
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return {
      success: true,
      message: "Signed in successfully.",
      user: session?.user,
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return { success: true, message: "Signed out successfully." };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, message: "Failed to sign out." };
  }
}
