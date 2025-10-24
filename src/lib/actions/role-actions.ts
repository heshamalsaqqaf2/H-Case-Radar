"use server";

import { and, count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { database as db } from "@/lib/database";
import {
  permission,
  role,
  rolePermissions,
  user,
  userRoles,
} from "@/lib/database/schema";

// إضافة هذا النوع في أعلى الملف
export interface RolePermission {
  permissionId: string;
  permissionName: string;
  resource: string;
  action: string;
}

function validateUuid(value: string): boolean {
  const uuidPattern =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidPattern.test(value);
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
  id: z.string().refine(
    (value) => {
      return validateUuid(value);
    },
    {
      message: "Invalid UUID format",
    },
  ),
});

const _assignPermissionsSchema = z.object({
  roleId: z.string().refine(
    (value) => {
      return validateUuid(value);
    },
    {
      message: "Invalid UUID format",
    },
  ),
  permissionIds: z.array(
    z.string().refine(
      (value) => {
        return validateUuid(value);
      },
      {
        message: "Invalid UUID format",
      },
    ),
  ),
});

// إنشاء دور جديد
export async function createRole(formData: FormData) {
  try {
    const validatedData = createRoleSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      isDefault: formData.get("isDefault") === "on",
    });

    // التحقق من عدم وجود دور بنفس الاسم
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

    // إنشاء الدور
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
        message: error.message || "Failed to create role",
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

    // التحقق من عدم وجود دور آخر بنفس الاسم
    const existingRole = await db
      .select()
      .from(role)
      .where(
        and(eq(role.name, validatedData.name), eq(role.id, validatedData.id)),
      )
      .limit(1);

    if (existingRole.length === 0) {
      const conflictRole = await db
        .select()
        .from(role)
        .where(
          and(eq(role.name, validatedData.name), eq(role.id, validatedData.id)),
        )
        .limit(1);

      if (conflictRole.length > 0) {
        return {
          success: false,
          message: "Another role with this name already exists",
        };
      }
    }

    // تحديث الدور
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
        message: error.message,
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
    // التحقق مما إذا كان الدور يستخدم من قبل أي مستخدم
    const { userRoles } = await import("@/lib/database/schema");

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

    // حذف علاقات الدور بالصلاحيات أولاً
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // ثم حذف الدور
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
    // حذف الصلاحيات الحالية أولاً
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // إضافة الصلاحيات الجديدة
    if (permissionIds.length > 0) {
      const rolePermissionValues = permissionIds.map((permissionId) => ({
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

// TODO:(محسن)
//  تجميع جميع الاستعلامات في استعلام واحد للحصول على بيانات الدور
export async function getRoleProfileData(roleId: string) {
  try {
    // استعلام واحد يجلب كل البيانات المطلوبة
    const [roleData, usersData, permissionsData, statistics] =
      await Promise.all([
        // بيانات الدور الأساسية
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

        // المستخدمين المعينين للدور
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
          .limit(50), // تحديد الحد الأقصى للأداء

        // الصلاحيات المرتبطة بالدور
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

        // الإحصائيات في استعلام واحد
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

    // نشاط افتراضي سريع (يمكن جلبها من قاعدة البيانات لاحقاً)
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
      permissions: permissionsData as RolePermission[], // تأكيد النوع
      statistics: statistics[0] || { usersCount: 0, permissionsCount: 0 },
      activity: recentActivity,
    };
  } catch (error) {
    console.error("Error getting role profile data:", error);
    return null;
  }
}

// ! TODO: old ***********************************************************
// الحصول على دور مع صلاحياته
export async function getRoleWithPermissions(roleId: string) {
  try {
    console.log(`🔍 Getting role with permissions for roleId: ${roleId}`);

    // الحصول على بيانات الدور
    const roleData = await db
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
      .limit(1);

    if (roleData.length === 0) {
      console.log(`❌ Role not found with id: ${roleId}`);
      return null;
    }

    // الحصول على صلاحيات الدور
    const rolePermissionsData = await db
      .select({
        permissionId: permission.id,
        permissionName: permission.name,
        resource: permission.resource,
        action: permission.action,
      })
      .from(rolePermissions)
      .innerJoin(permission, eq(rolePermissions.permissionId, permission.id))
      .where(eq(rolePermissions.roleId, roleId));

    console.log(`✅ Found role with ${rolePermissionsData.length} permissions`);

    return {
      ...roleData[0],
      permissions: rolePermissionsData,
    };
  } catch (error) {
    console.error("❌ Error getting role with permissions:", error);
    return null;
  }
}

// الحصول على إحصائيات الدور
export async function getRoleStatistics(roleId: string) {
  try {
    // عدد المستخدمين الذين لديهم هذا الدور
    const usersCount = await db
      .select({ count: count() })
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId));

    // عدد الصلاحيات المرتبطة بالدور
    const permissionsCount = await db
      .select({ count: count() })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));

    // تاريخ إنشاء الدور
    const roleData = await db
      .select({ createdAt: role.createdAt })
      .from(role)
      .where(eq(role.id, roleId))
      .limit(1);

    return {
      usersCount: usersCount[0]?.count || 0,
      permissionsCount: permissionsCount[0]?.count || 0,
      createdAt: roleData[0]?.createdAt || new Date(),
    };
  } catch (error) {
    console.error("Error getting role statistics:", error);
    return {
      usersCount: 0,
      permissionsCount: 0,
      createdAt: new Date(),
    };
  }
}

// الحصول على المستخدمين الذين لديهم هذا الدور
export async function getRoleUsers(roleId: string) {
  try {
    const roleUsers = await db
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
      .orderBy(user.name);

    return roleUsers;
  } catch (error) {
    console.error("Error getting role users:", error);
    return [];
  }
}

// الحصول على نشاط الدور (يمكن توسيعه لاحقاً)
export async function getRoleActivity(roleId: string) {
  try {
    // هذا مثال - يمكن ربطه بجدول النشاطات لاحقاً
    const recentActivity = [
      {
        id: 1,
        action: "Permissions Updated",
        description: "Role permissions were modified",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // منذ ساعتين
        type: "permission" as const,
      },
      {
        id: 2,
        action: "User Assigned",
        description: "User john@example.com was assigned this role",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // منذ يوم
        type: "user" as const,
      },
      {
        id: 3,
        action: "Role Created",
        description: "Role was created in the system",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // منذ أسبوع
        type: "system" as const,
      },
    ];

    return recentActivity;
  } catch (error) {
    console.error("Error getting role activity:", error);
    return [];
  }
}
// ! TODO: ***********************************************************
