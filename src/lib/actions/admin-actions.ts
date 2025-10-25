// lib/actions/admin-actions.ts
"use server";

import { and, eq } from "drizzle-orm";
import { database as db } from "@/lib/database";
import { permission, role, user, userRoles } from "@/lib/database/schema";

export async function getUsersWithRoles() {
  try {
    console.log("🔍 Getting users with roles...");

    // 1. الحصول على جميع المستخدمين
    const allUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.name);

    // 2. الحصول على جميع علاقات المستخدمين بالأدوار
    const allUserRoles = await db
      .select({
        userId: userRoles.userId,
        roleId: role.id,
        roleName: role.name,
        roleDescription: role.description,
      })
      .from(userRoles)
      .innerJoin(role, eq(userRoles.roleId, role.id));

    console.log(
      `✅ Found ${allUsers.length} users and ${allUserRoles.length} role assignments`,
    );

    // 3. تجميع الأدوار لكل مستخدم باستخدام Map
    const userRoleMap = new Map();

    allUserRoles.forEach((userRole) => {
      if (!userRoleMap.has(userRole.userId)) {
        userRoleMap.set(userRole.userId, []);
      }
      userRoleMap.get(userRole.userId).push({
        id: userRole.roleId,
        name: userRole.roleName,
        description: userRole.roleDescription,
      });
    });

    // 4. بناء النتيجة النهائية
    const usersWithRoles = allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      roles: userRoleMap.get(user.id) || [], // إذا لم يكن له أدوار، إرجاع مصفوفة فارغة
    }));

    console.log(
      `🎯 Successfully processed ${usersWithRoles.length} users with roles`,
    );

    return usersWithRoles;
  } catch (error) {
    console.error("❌ Error in getUsersWithRoles:", error);
    return [];
  }
}

export async function getAllRoles() {
  try {
    const roles = await db.select().from(role).orderBy(role.name);

    console.log(`✅ Found ${roles.length} roles`);
    return roles;
  } catch (error) {
    console.error("Error getting roles:", error);
    return [];
  }
}

export async function getAllPermissions() {
  try {
    const permissions = await db
      .select()
      .from(permission)
      .orderBy(permission.resource, permission.action);

    console.log(`✅ Found ${permissions.length} permissions`);
    return permissions;
  } catch (error) {
    console.error("Error getting permissions:", error);
    return [];
  }
}

export async function assignRoleToUser(userId: string, roleId: string) {
  try {
    console.log(`🔗 Assigning role ${roleId} to user ${userId}`);

    // التحقق من وجود العلاقة مسبقاً
    const existingRelation = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .limit(1);

    if (existingRelation.length > 0) {
      console.log("ℹ️ User already has this role");
      return { success: false, message: "User already has this role" };
    }

    // إضافة العلاقة
    await db.insert(userRoles).values({
      userId,
      roleId,
    });

    console.log("✅ Role assigned successfully");
    return { success: true, message: "Role assigned successfully" };
  } catch (error) {
    console.error("❌ Error assigning role:", error);
    return { success: false, message: "Failed to assign role" };
  }
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  try {
    console.log(`🗑️ Removing role ${roleId} from user ${userId}`);

    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));

    console.log("✅ Role removed successfully");
    return { success: true, message: "Role removed successfully" };
  } catch (error) {
    console.error("❌ Error removing role:", error);
    return { success: false, message: "Failed to remove role" };
  }
}
