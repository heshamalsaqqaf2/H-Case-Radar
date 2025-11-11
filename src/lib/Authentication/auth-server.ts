import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
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
      personalEmail: {
        type: "string",
        required: true,
        unique: true,
        input: false,
      },
      role: {
        fieldName: "role_better_auth",
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  plugins: [admin(), nextCookies()],
});
