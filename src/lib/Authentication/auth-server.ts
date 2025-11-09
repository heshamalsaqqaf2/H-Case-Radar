import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, lastLoginMethod } from "better-auth/plugins";
import * as schema from "@/lib/database/schema";
import { database } from "../database/server";

export const auth = betterAuth({
  database: drizzleAdapter(database, {
    provider: "pg",
    schema: schema,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },

  plugins: [admin(), lastLoginMethod(), nextCookies()],
});
