// src/lib/authorization/services/admin/role-service.ts
import { and, eq, not, sql } from "drizzle-orm";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import type {
  Permission,
  RoleProfileData,
  RoleWithUserCount,
} from "@/lib/authorization/types/roles";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "@/lib/authorization/validators/admin/role-validator";
import { permission, role, rolePermissions, user, userRoles } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";
import { Errors } from "@/lib/errors/error-factory";

async function authorize(userId: string, requiredPermission: string) {
  const check = await authorizationService.checkPermission({ userId }, requiredPermission);
  if (!check.allowed) {
    throw Errors.forbidden("إدارة الأدوار");
  }
}

export async function createRole(userId: string, input: CreateRoleInput) {
  await authorize(userId, AUDIT_LOG_ACTIONS.ROLE.CREATE);

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
  await authorize(userId, AUDIT_LOG_ACTIONS.ROLE.UPDATE);

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
  await authorize(userId, AUDIT_LOG_ACTIONS.ROLE.DELETE);

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
  await authorize(userId, AUDIT_LOG_ACTIONS.ROLE.ASSIGN_PERMISSIONS);
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  if (permissionIds.length > 0) {
    const values = permissionIds.map((pid) => ({ roleId, permissionId: pid }));
    await db.insert(rolePermissions).values(values);
  }
}

export async function getAllRoles(): Promise<RoleWithUserCount[]> {
  const roles = await db
    .select({
      id: role.id,
      name: role.name,
      description: role.description,
      isDefault: role.isDefault,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    })
    .from(role)
    .orderBy(role.name);

  // جلب عدد المستخدمين لكل دور
  const userCounts = await db
    .select({
      roleId: userRoles.roleId,
      count: sql<number>`count(*)`,
    })
    .from(userRoles)
    .groupBy(userRoles.roleId);

  const userCountMap = new Map(userCounts.map((uc) => [uc.roleId, uc.count]));

  return roles.map((role) => ({
    ...role,
    userCount: userCountMap.get(role.id) || 0,
  }));
}

export async function getRoleProfileData(roleId: string): Promise<RoleProfileData | null> {
  const [roleData, usersData, permissionsData] = await Promise.all([
    // ✅ جلب بيانات الدور
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

    // ✅ جلب المستخدمين - متوافق مع UserRoleAssignment
    db
      .select({
        userId: user.id, // ✅ تغيير من id إلى userId
        userName: user.name, // ✅ تغيير من name إلى userName
        userEmail: user.email, // ✅ تغيير من email إلى userEmail
        userCreatedAt: user.createdAt, // ✅ تغيير من createdAt إلى userCreatedAt
        assignedAt: userRoles.createdAt,
      })
      .from(userRoles)
      .innerJoin(user, eq(userRoles.userId, user.id))
      .where(eq(userRoles.roleId, roleId))
      .orderBy(user.name)
      .limit(20),

    // ✅ جلب الصلاحيات - متوافق مع Permission[]
    db
      .select({
        id: permission.id, // ✅ استخدام id بدل permissionId
        name: permission.name, // ✅ استخدام name بدل permissionName
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        conditions: permission.conditions,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      })
      .from(rolePermissions)
      .innerJoin(permission, eq(rolePermissions.permissionId, permission.id))
      .where(eq(rolePermissions.roleId, roleId)),
  ]);

  if (roleData.length === 0) {
    return null;
  }

  // ✅ activity متوافق مع النوع
  const activity: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: Date;
    type: "view" | "create" | "update" | "delete";
  }> = [
    {
      id: "1", // ✅ تغيير من number إلى string
      action: "Profile Viewed",
      description: "Role profile was accessed",
      timestamp: new Date(),
      type: "view" as const,
    },
  ];

  return {
    role: roleData[0], // ✅ إزالة userCount - ليس جزءاً من Role
    users: usersData, // ✅ الآن متوافق مع UserRoleAssignment[]
    permissions: permissionsData as unknown as Permission[], // ✅ الآن متوافق مع Permission[]
    statistics: {
      usersCount: usersData.length,
      permissionsCount: permissionsData.length,
    },
    activity,
  };
}

// export async function getRoleProfileData(roleId: string): Promise<RoleProfileData | null> {
//   const [roleData, usersData, permissionsData] = await Promise.all([
//     db
//       .select({
//         id: role.id,
//         name: role.name,
//         description: role.description,
//         isDefault: role.isDefault,
//         createdAt: role.createdAt,
//         updatedAt: role.updatedAt,
//       })
//       .from(role)
//       .where(eq(role.id, roleId))
//       .limit(1),

//     db
//       .select({
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         createdAt: user.createdAt,
//         assignedAt: userRoles.createdAt,
//       })
//       .from(userRoles)
//       .innerJoin(user, eq(userRoles.userId, user.id))
//       .where(eq(userRoles.roleId, roleId))
//       .orderBy(user.name)
//       .limit(20), // ✅ حد معقول

//     db
//       .select({
//         permissionId: permission.id,
//         permissionName: permission.name,
//         resource: permission.resource,
//         action: permission.action,
//       })
//       .from(rolePermissions)
//       .innerJoin(permission, eq(rolePermissions.permissionId, permission.id))
//       .where(eq(rolePermissions.roleId, roleId)),
//   ]);

//   if (roleData.length === 0) {
//     return null;
//   }

//   // ✅ activity أكثر واقعية (إذا كان لديك جدول audit)
//   const activity = [
//     {
//       id: 1,
//       action: "Profile Viewed",
//       description: "Role profile was accessed",
//       timestamp: new Date(),
//       type: "view" as const,
//     },
//   ];

//   return {
//     role: {
//       ...roleData[0],
//       userCount: usersData.length,
//     },
//     users: usersData,
//     permissions: permissionsData as RolePermission[],
//     statistics: {
//       usersCount: usersData.length,
//       permissionsCount: permissionsData.length,
//     },
//     activity,
//   };
// }

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
