import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { database } from "../database";
import * as schema from "../database/schema";

export const auth = betterAuth({
  database: drizzleAdapter(database, {
    provider: "pg",
    schema: schema,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  plugins: [nextCookies()],
});

// export type Session = typeof auth.$Infer.Session;
// export type User = typeof auth.$Infer.Session.user;
