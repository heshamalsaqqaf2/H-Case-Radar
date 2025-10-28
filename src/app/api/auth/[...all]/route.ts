import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/authentication/auth-server";

export const { GET, POST } = toNextJsHandler(auth.handler);
