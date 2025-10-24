import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/Authentication/auth-server";

export const { GET, POST } = toNextJsHandler(auth.handler);
