"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { auth } from "./auth-server";

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new APIError("UNAUTHORIZED", {
        message: "You Are Not Signed In, Please Sign In First.",
        cause: "not_logged_in",
        code: "401",
      });
    }
    return session.user.id;
  } catch (error) {
    if (error instanceof APIError) {
      return new APIError("BAD_REQUEST", {
        message: "Something Went Wrong, Please Try Again Later.",
        cause: "something_went_wrong",
        code: "400",
      });
    }
  }
}
