// src/lib/authorization/services/admin/role-service.ts
import { and, eq, not, sql } from "drizzle-orm";
import { authorizationService } from "@/lib/authentication/permission-system";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "@/lib/authorization/validators/admin/role-validator";
import { database as db } from "@/lib/database";
import {
  permission,
  role,
  rolePermissions,
  user,
  userRoles,
} from "@/lib/database/schema";
import { Errors } from "@/lib/errors/error-factory";
import type { RolePermission, RoleProfileData } from "@/lib/types/roles";

async function authorize(userId: string, requiredPermission: string) {
  const check = await authorizationService.checkPermission(
    { userId },
    requiredPermission,
  );
  if (!check.allowed) {
    throw Errors.forbidden("إدارة الأدوار");
  }
}

export async function createRole(userId: string, input: CreateRoleInput) {
  await authorize(userId, "roles.create");

  const existing = await db
    .select({ id: role.id })
    .from(role)
    .where(eq(role.name, input.name))
    .limit(1);

  if (existing.length > 0) {
    throw Errors.conflict("اسم الدور مستخدم بالفعل");
  }

  const [newRole] = await db.insert(role).values(input).returning();
  return newRole;
}

export async function updateRole(userId: string, input: UpdateRoleInput) {
  await authorize(userId, "roles.update");

  const conflict = await db
    .select({ id: role.id })
    .from(role)
    .where(and(eq(role.name, input.name), not(eq(role.id, input.id))))
    .limit(1);

  if (conflict.length > 0) {
    throw Errors.conflict("اسم الدور مستخدم من قبل دور آخر");
  }

  const [updated] = await db
    .update(role)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(role.id, input.id))
    .returning();

  if (!updated) throw Errors.notFound("الدور");
  return updated;
}

export async function deleteRole(userId: string, roleId: string) {
  await authorize(userId, "roles.delete");

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userRoles)
    .where(eq(userRoles.roleId, roleId));

  if (count > 0) {
    throw Errors.conflict("لا يمكن حذف دور مرتبط بمستخدمين");
  }

  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  await db.delete(role).where(eq(role.id, roleId));
}

export async function assignPermissionsToRole(
  userId: string,
  roleId: string,
  permissionIds: string[],
) {
  await authorize(userId, "roles.assign_permissions");

  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

  if (permissionIds.length > 0) {
    const values = permissionIds.map((pid) => ({ roleId, permissionId: pid }));
    await db.insert(rolePermissions).values(values);
  }
}

// *جلب بيانات ملف معلومات الدور
export async function getRoleProfileData(
  roleId: string,
): Promise<RoleProfileData | null> {
  const [roleData, usersData, permissionsData] = await Promise.all([
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
      .innerJoin(permission, eq(rolePermissions.permissionId, permission.id))
      .where(eq(rolePermissions.roleId, roleId)),
  ]);

  if (roleData.length === 0) return null;

  const activity = [
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
    statistics: {
      usersCount: usersData.length,
      permissionsCount: permissionsData.length,
    },
    activity,
  };
}

// export async function getRoleProfileData(roleId: string) {
//   try {
//     const [roleData, usersData, permissionsData] = await Promise.all([
//       db
//         .select({
//           id: role.id,
//           name: role.name,
//           description: role.description,
//           isDefault: role.isDefault,
//           createdAt: role.createdAt,
//           updatedAt: role.updatedAt,
//         })
//         .from(role)
//         .where(eq(role.id, roleId))
//         .limit(1),

//       db
//         .select({
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           createdAt: user.createdAt,
//           assignedAt: userRoles.createdAt,
//         })
//         .from(userRoles)
//         .innerJoin(user, eq(userRoles.userId, user.id))
//         .where(eq(userRoles.roleId, roleId))
//         .orderBy(user.name)
//         .limit(50),

//       db
//         .select({
//           permissionId: permission.id,
//           permissionName: permission.name,
//           resource: permission.resource,
//           action: permission.action,
//         })
//         .from(rolePermissions)
//         .innerJoin(permission, eq(rolePermissions.permissionId, permission.id))
//         .where(eq(rolePermissions.roleId, roleId)),
//     ]);

//     if (roleData.length === 0) {
//       throw Errors.notFound("الدور");
//     }

//     const activity = [
//       {
//         id: 1,
//         action: "Profile Viewed",
//         description: "Role profile was accessed",
//         timestamp: new Date(),
//         type: "view" as const,
//       },
//     ];

//     return {
//       role: roleData[0],
//       users: usersData,
//       permissions: permissionsData as RolePermission[],
//       statistics: {
//         usersCount: usersData.length,
//         permissionsCount: permissionsData.length,
//       },
//       activity,
//     } satisfies RoleProfileData;
//   } catch (error) {
//     if (error instanceof AppError) throw error;
//     throw Errors.database(error);
//   }
// }
