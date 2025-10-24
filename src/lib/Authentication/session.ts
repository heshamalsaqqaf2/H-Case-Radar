"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { auth } from "./auth-server";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new APIError("UNAUTHORIZED", {
      message: "You are not logged in.",
      cause: "not_logged_in",
      code: "401",
    });
  }
  return session.user.id;
}
