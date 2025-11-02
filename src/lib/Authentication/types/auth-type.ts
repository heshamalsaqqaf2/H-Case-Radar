import type { auth } from "@/lib/authentication/auth-server";

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;
