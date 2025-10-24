import type { auth } from "./auth-server";

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;
