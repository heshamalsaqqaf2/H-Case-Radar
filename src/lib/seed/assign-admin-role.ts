import { eq } from "drizzle-orm";
import { role, user, userRoles } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";

export async function assignSuperAdminToCurrentUser(userEmail: string) {
  try {
    console.log(`👤 Assigning super_admin role to user: ${userEmail}`);

    // البحث عن المستخدم
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.email, userEmail))
      .limit(1);

    if (currentUser.length === 0) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    console.log(`✅ Found user: ${currentUser[0].name}`);

    // البحث عن دور super_admin
    const superAdminRole = await db
      .select()
      .from(role)
      .where(eq(role.name, "super_admin"))
      .limit(1);

    if (superAdminRole.length === 0) {
      throw new Error("super_admin role not found. Please run db:seed first.");
    }

    console.log(`✅ Found role: ${superAdminRole[0].name}`);

    // التحقق إذا كان المستخدم لديه الدور مسبقاً
    const existingRelation = await db
      .select()
      .from(userRoles)
      .where(
        eq(userRoles.userId, currentUser[0].id) &&
          eq(userRoles.roleId, superAdminRole[0].id),
      )
      .limit(1);

    if (existingRelation.length > 0) {
      console.log("ℹ️ User already has super_admin role");
      return { success: true, message: "User already has super_admin role" };
    }

    // تعيين الدور للمستخدم
    await db.insert(userRoles).values({
      userId: currentUser[0].id,
      roleId: superAdminRole[0].id,
    });

    console.log("✅ Successfully assigned super_admin role to user");

    return {
      success: true,
      message: `Super admin role assigned to ${userEmail}`,
    };
  } catch (error) {
    console.error("❌ Failed to assign role:", error);
    throw error;
  }
}
