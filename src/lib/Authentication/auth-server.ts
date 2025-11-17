import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, createAuthMiddleware } from "better-auth/plugins";
import * as schema from "@/lib/database/schema";
import { database } from "@/lib/database/server";

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
        unique: true,
        input: true,
      },
      accountStatus: {
        type: "string",
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

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // if (!ctx.body?.email.endsWith("@gmail.com")) {
      //   throw new APIError("BAD_REQUEST", {
      //     message: "Email must end with @gmail.com",
      //   });
      // }
      // ctx.user هو المستخدم الذي سُجل دخوله
      // const userStatus = ctx.context.session?.user.accountStatus; // افتراضيًا pending
      // if (userStatus === "rejected") {
      //   return ctx.redirect("/account-rejected");
      // }
      // if (userStatus === "pending") {
      //   return ctx.redirect("/waiting-approval");
      // }
      // if (userStatus === "accepted") {
      //   return ctx.redirect("/account-accepted");
      // }
      // ✅ إذا كانت الحالة pending، يمكنك توجيه المستخدم لاحقًا بعد تسجيل الدخول
      // أو تمرير الحالة إلى الواجهة لاتخاذ القرار هناك.
      // هذا مثال على تمرير الحالة في `session` أو `user`.
      // ctx.user.status = userStatus; // إذا كنت تريد تمريرها مع بيانات المستخدم
      // return ctx.redirect("/dashboard");
    }),
  },

  plugins: [admin(), nextCookies()],
});
