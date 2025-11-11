// src/lib/authorization/services/admin/user-service.ts

import { and, count, desc, eq, not } from "drizzle-orm";
import { auth } from "@/lib/authentication/auth-server";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import type {
  BaseUser,
  CreateUserInput,
  CreateUserResponse,
  UpdateUserInput,
  UserRole,
  UserWithRoles,
  UserWithRolesAndPermissions,
} from "@/lib/authorization/types/user";
import { auditLog, role, user, userRoles } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";
import { Errors } from "@/lib/errors/error-factory";

async function authorize(userId: string, requiredPermission: string) {
  const check = await authorizationService.checkPermission({ userId }, requiredPermission);
  if (!check.allowed) {
    throw Errors.forbidden("إدارة المستخدمين");
  }
}

export async function getUsersWithRoles(): Promise<UserWithRoles[]> {
  const allUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .orderBy(user.name);

  const allUserRoles = await db
    .select({
      userId: userRoles.userId,
      roleId: role.id,
      roleName: role.name,
      roleDescription: role.description,
      roleIsDefault: role.isDefault,
    })
    .from(userRoles)
    .innerJoin(role, eq(userRoles.roleId, role.id));

  const userRoleMap = new Map<string, UserRole[]>();
  allUserRoles.forEach((ur) => {
    const roles = userRoleMap.get(ur.userId) ?? [];
    roles.push({
      id: ur.roleId,
      name: ur.roleName,
      description: ur.roleDescription,
      isDefault: ur.roleIsDefault,
    });
    userRoleMap.set(ur.userId, roles);
  });

  return allUsers.map((u) => ({
    ...u,
    roles: userRoleMap.get(u.id) ?? [],
  }));
}

export async function getUsersWithRolesAndPermissions(): Promise<UserWithRolesAndPermissions[]> {
  const usersWithRoles = await getUsersWithRoles();

  // جلب الصلاحيات لكل مستخدم
  const usersWithPermissions = await Promise.all(
    usersWithRoles.map(async (user) => {
      const permissions = await authorizationService.getUserPermissions(user.id);

      return {
        ...user,
        permissions: permissions.map((perm) => ({
          id: "", // لن نحصل على ID من getUserPermissions الحالية
          name: perm.name,
          resource: perm.resource,
          action: perm.action,
          description: null,
          conditions: perm.conditions,
        })),
      };
    }),
  );

  return usersWithPermissions;
}

export async function assignRoleToUser(userId: string, targetUserId: string, roleId: string) {
  await authorize(userId, AUDIT_LOG_ACTIONS.USER.ASSIGN_ROLE); //"users.assign_roles"
  const existing = await db
    .select()
    .from(userRoles)
    .where(and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, roleId)))
    .limit(1);

  if (existing.length > 0) {
    throw Errors.conflict("المستخدم يمتلك هذا الدور بالفعل");
  }

  await db.insert(userRoles).values({ userId: targetUserId, roleId });
}

export async function removeRoleFromUser(userId: string, targetUserId: string, roleId: string) {
  await authorize(userId, AUDIT_LOG_ACTIONS.USER.REMOVE_ROLE); //"users.remove_roles"

  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, roleId)));
}

export async function getCurrentUser(userId: string) {
  const [userData] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      banned: user.banned,
      banReason: user.banReason,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    throw Errors.notFound("User");
  }
  return userData;
}

// تحديث ملف المستخدم
export async function updateUserProfile(
  adminUserId: string,
  targetUserId: string,
  updates: UpdateUserInput,
): Promise<BaseUser> {
  await authorize(adminUserId, AUDIT_LOG_ACTIONS.USER.UPDATE); //"user.update"

  // التحقق من وجود المستخدم
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!existingUser) {
    throw Errors.notFound("المستخدم");
  }

  // التحقق من عدم تكرار البريد الإلكتروني
  if (updates.email) {
    const [duplicate] = await db
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.email, updates.email), not(eq(user.id, targetUserId))))
      .limit(1);

    if (duplicate) {
      throw Errors.conflict("البريد الإلكتروني مستخدم بالفعل");
    }
  }

  const [updatedUser] = await db
    .update(user)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(user.id, targetUserId))
    .returning();

  return updatedUser;
}

// حظر/فك حظر مستخدم
export async function toggleUserBan(
  adminUserId: string,
  targetUserId: string,
  ban: boolean,
  reason?: string,
): Promise<BaseUser> {
  await authorize(adminUserId, AUDIT_LOG_ACTIONS.USER.MANAGE); //"user.manage"

  const [updatedUser] = await db
    .update(user)
    .set({
      banned: ban,
      banReason: reason || null,
      banExpires: ban ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 يوم
      updatedAt: new Date(),
    })
    .where(eq(user.id, targetUserId))
    .returning();

  if (!updatedUser) {
    throw Errors.notFound("المستخدم");
  }

  return updatedUser;
}

//  جلب إحصائيات المستخدم
export async function getUserStatistics(userId: string) {
  const [userData, rolesCount, loginCount, lastActivity] = await Promise.all([
    db.select().from(user).where(eq(user.id, userId)).limit(1),
    db.select({ count: count() }).from(userRoles).where(eq(userRoles.userId, userId)),
    db
      .select({ count: count() })
      .from(auditLog)
      .where(and(eq(auditLog.userId, userId), eq(auditLog.action, AUDIT_LOG_ACTIONS.USER.LOGIN))), // "user.login"
    db
      .select({ timestamp: auditLog.createdAt })
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(1),
  ]);

  if (!userData[0]) {
    throw Errors.notFound("المستخدم");
  }

  return {
    user: userData[0],
    statistics: {
      rolesCount: rolesCount[0]?.count || 0,
      loginCount: loginCount[0]?.count || 0,
      lastActivity: lastActivity[0]?.timestamp,
      isBanned: userData[0].banned,
      banReason: userData[0].banReason,
    },
  };
}

//  تحديث آخر وقت دخول
export async function updateLastLogin(userId: string): Promise<void> {
  await db
    .update(user)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
}

// استخدام Better Auth لإنشاء المستخدم
export async function createUserWithRoles(
  adminUserId: string,
  userData: CreateUserInput,
): Promise<CreateUserResponse> {
  await authorize(adminUserId, AUDIT_LOG_ACTIONS.USER.CREATE);

  // التحقق من عدم تكرار البريد الإلكتروني
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, userData.email))
    .limit(1);

  if (existingUser) {
    throw Errors.conflict("البريد الإلكتروني مستخدم بالفعل");
  }

  // استخدام Better Auth لإنشاء المستخدم
  const authResult = await auth.api.createUser({
    body: {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    },
  });

  if (!authResult.user) {
    throw Errors.internal("فشل في إنشاء المستخدم في نظام المصادقة");
  }

  const authUser = authResult.user;

  // ✅ إنشاء كائن BaseUser متوافق مع الأنواع
  const newUser: BaseUser = {
    id: authUser.id,
    name: authUser.name || userData.name,
    email: authUser.email,
    emailVerified: authUser.emailVerified || false,
    image: authUser.image || null,
    banned: false, // ✅ قيمة افتراضية
    banReason: null, // ✅ قيمة افتراضية
    banExpires: null, // ✅ قيمة افتراضية
    lastLoginAt: null, // ✅ قيمة افتراضية
    createdAt: authUser.createdAt || new Date(),
    updatedAt: new Date(),
  };

  // تعيين الأدوار المطلوبة
  const assignedRoles: UserRole[] = [];
  if (userData.roleIds && userData.roleIds.length > 0) {
    for (const roleId of userData.roleIds) {
      await assignRoleToUser(adminUserId, newUser.id, roleId);

      const [roleData] = await db.select().from(role).where(eq(role.id, roleId)).limit(1);

      if (roleData) {
        assignedRoles.push({
          id: roleData.id,
          name: roleData.name,
          description: roleData.description,
          isDefault: roleData.isDefault,
        });
      }
    }
  }

  return {
    user: newUser, // ✅ الآن متوافق مع BaseUser
    temporaryPassword: userData.sendWelcomeEmail ? userData.password : undefined,
    assignedRoles,
  };
}
