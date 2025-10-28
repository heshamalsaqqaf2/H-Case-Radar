// lib/actions/role-actions.ts
"use server";

import { and, eq, not, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { database as db } from "@/lib/database/index";
import {
  permission,
  role,
  rolePermissions,
  user,
  userRoles,
} from "@/lib/database/schema";

export interface RolePermission {
  permissionId: string;
  permissionName: string;
  resource: string;
  action: string;
}

interface RoleProfileData {
  role: {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
  users: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    assignedAt: Date;
  }[];
  permissions: RolePermission[];
  statistics: {
    usersCount: number;
    permissionsCount: number;
  };
  activity: {
    id: number;
    action: string;
    description: string;
    timestamp: Date;
    type: "user" | "permission" | "system" | "view";
  }[];
}

// Schemas للتحقق من الصحة
const createRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Name can only contain letters, numbers and underscores",
    ),
  description: z.string().min(5).max(200),
  isDefault: z.boolean().default(false),
});

const updateRoleSchema = createRoleSchema.extend({
  id: z.string().uuid(),
});

// إنشاء دور جديد
export async function createRole(formData: FormData) {
  try {
    const validatedData = createRoleSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      isDefault: formData.get("isDefault") === "on",
    });

    const existingRole = await db
      .select()
      .from(role)
      .where(eq(role.name, validatedData.name))
      .limit(1);

    if (existingRole.length > 0) {
      return {
        success: false,
        message: "Role with this name already exists",
      };
    }

    const newRole = await db.insert(role).values(validatedData).returning();

    revalidatePath("/admin/roles");

    return {
      success: true,
      message: "Role created successfully",
      data: newRole[0],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message || "Failed to create role",
      };
    }

    console.error("Error creating role:", error);
    return {
      success: false,
      message: "Failed to create role",
    };
  }
}

// تحديث دور
export async function updateRole(formData: FormData) {
  try {
    const validatedData = updateRoleSchema.parse({
      id: formData.get("id"),
      name: formData.get("name"),
      description: formData.get("description"),
      isDefault: formData.get("isDefault") === "on",
    });

    // ✅ التصحيح: استخدام not(eq(...)) لتجنب التكرار
    const conflictRole = await db
      .select()
      .from(role)
      .where(
        and(
          eq(role.name, validatedData.name),
          not(eq(role.id, validatedData.id)),
        ),
      )
      .limit(1);

    if (conflictRole.length > 0) {
      return {
        success: false,
        message: "Another role with this name already exists",
      };
    }

    const updatedRole = await db
      .update(role)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        isDefault: validatedData.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(role.id, validatedData.id))
      .returning();

    revalidatePath("/admin/roles");

    return {
      success: true,
      message: "Role updated successfully",
      data: updatedRole[0],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }

    console.error("Error updating role:", error);
    return {
      success: false,
      message: "Failed to update role",
    };
  }
}

// حذف دور
export async function deleteRole(roleId: string) {
  try {
    const userRoleRelations = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId))
      .limit(1);

    if (userRoleRelations.length > 0) {
      return {
        success: false,
        message: "Cannot delete role that is assigned to users",
      };
    }

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    await db.delete(role).where(eq(role.id, roleId));

    revalidatePath("/admin/roles");

    return {
      success: true,
      message: "Role deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      success: false,
      message: "Failed to delete role",
    };
  }
}

// تعيين الصلاحيات للدور
export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[],
) {
  try {
    // ✅ التحقق من القيم المطلوبة
    if (!roleId) {
      return { success: false, message: "Role ID is required" };
    }

    if (!Array.isArray(permissionIds)) {
      return { success: false, message: "Permission IDs must be an array" };
    }

    const validPermissionIds = permissionIds.filter(
      (id) => typeof id === "string" && id.trim() !== "",
    );
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    if (validPermissionIds.length > 0) {
      const rolePermissionValues = validPermissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      }));

      await db.insert(rolePermissions).values(rolePermissionValues);
    }

    revalidatePath("/admin/roles");

    return {
      success: true,
      message: "Permissions assigned successfully",
    };
  } catch (error) {
    console.error("Error assigning permissions:", error);
    return {
      success: false,
      message: "Failed to assign permissions",
    };
  }
}

// دالة موحدة لجلب ملف الدور كاملاً
export async function getRoleProfileData(
  roleId: string,
): Promise<RoleProfileData | null> {
  try {
    const [roleData, usersData, permissionsData, statistics] =
      await Promise.all([
        db
          .select({
            id: role.id,
            name: role.name,
            description: role.description,
            isDefault: role.isDefault,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
          })
          .from(role)
          .where(eq(role.id, roleId))
          .limit(1),

        db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            assignedAt: userRoles.createdAt,
          })
          .from(userRoles)
          .innerJoin(user, eq(userRoles.userId, user.id))
          .where(eq(userRoles.roleId, roleId))
          .orderBy(user.name)
          .limit(50),

        db
          .select({
            permissionId: permission.id,
            permissionName: permission.name,
            resource: permission.resource,
            action: permission.action,
          })
          .from(rolePermissions)
          .innerJoin(
            permission,
            eq(rolePermissions.permissionId, permission.id),
          )
          .where(eq(rolePermissions.roleId, roleId)),

        db
          .select({
            usersCount: sql<number>`COUNT(DISTINCT ${userRoles.userId})`,
            permissionsCount: sql<number>`COUNT(DISTINCT ${rolePermissions.permissionId})`,
          })
          .from(role)
          .leftJoin(userRoles, eq(role.id, userRoles.roleId))
          .leftJoin(rolePermissions, eq(role.id, rolePermissions.roleId))
          .where(eq(role.id, roleId))
          .groupBy(role.id)
          .limit(1),
      ]);

    if (roleData.length === 0) {
      return null;
    }

    const recentActivity = [
      {
        id: 1,
        action: "Profile Viewed",
        description: "Role profile was accessed",
        timestamp: new Date(),
        type: "view" as const,
      },
    ];

    return {
      role: roleData[0],
      users: usersData,
      permissions: permissionsData as RolePermission[],
      statistics: statistics[0] || { usersCount: 0, permissionsCount: 0 },
      activity: recentActivity,
    };
  } catch (error) {
    console.error("Error getting role profile data:", error);
    return null;
  }
}
