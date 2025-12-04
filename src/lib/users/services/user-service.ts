/** biome-ignore-all lint/complexity/noStaticOnlyClass: <> */
import { eq } from "drizzle-orm";
import { user } from "@/lib/database/schema/auth-schema";
import { database as db } from "@/lib/database/server";
import { Errors } from "@/lib/errors/error-factory";
import type { UpdateUserProfileInput } from "../validators/user-validator";

export class UserService {
  static async getUserProfile(userId: string) {
    const [userRecord] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        personalEmail: user.personalEmail,
        image: user.image,
        role: user.role_better_auth,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (!userRecord) return null;
    return userRecord;
  }

  static async updateProfile(userId: string, input: UpdateUserProfileInput) {
    const [updated] = await db
      .update(user)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        personalEmail: user.personalEmail,
        image: user.image,
      });

    if (!updated) throw Errors.notFound("المستخدم");
    return updated;
  }
}
