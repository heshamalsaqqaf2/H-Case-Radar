// src/lib/authorization/services/admin/user-service.ts
import { and, eq } from "drizzle-orm";
import { authorizationService } from "@/lib/authentication/permission-system";
import { getCurrentUserId } from "@/lib/authentication/session";
import { database as db } from "@/lib/database";
import { role, user, userRoles } from "@/lib/database/schema";
import { Errors } from "@/lib/errors/error-factory";
import { AppError } from "@/lib/errors/error-types";
import type { UserWithRoles } from "@/lib/types/user";

async function authorize(userId: string, requiredPermission: string) {
  const check = await authorizationService.checkPermission(
    { userId },
    requiredPermission,
  );
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
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.name);

  const allUserRoles = await db
    .select({
      userId: userRoles.userId,
      roleId: role.id,
      roleName: role.name,
      roleDescription: role.description,
    })
    .from(userRoles)
    .innerJoin(role, eq(userRoles.roleId, role.id));

  const userRoleMap = new Map<
    string,
    { id: string; name: string; description: string | null }[]
  >();
  allUserRoles.forEach((ur) => {
    const roles = userRoleMap.get(ur.userId) ?? [];
    roles.push({
      id: ur.roleId,
      name: ur.roleName,
      description: ur.roleDescription,
    });
    userRoleMap.set(ur.userId, roles);
  });

  return allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    roles: userRoleMap.get(u.id) ?? [],
  }));
}

export async function assignRoleToUser(
  userId: string,
  targetUserId: string,
  roleId: string,
) {
  await authorize(userId, "users.assign_roles");

  const existing = await db
    .select()
    .from(userRoles)
    .where(
      and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, roleId)),
    )
    .limit(1);

  if (existing.length > 0) {
    throw Errors.conflict("المستخدم يمتلك هذا الدور بالفعل");
  }

  await db.insert(userRoles).values({ userId: targetUserId, roleId });
}

export async function removeRoleFromUser(
  userId: string,
  targetUserId: string,
  roleId: string,
) {
  await authorize(userId, "users.remove_roles");

  await db
    .delete(userRoles)
    .where(
      and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, roleId)),
    );
}

// !جلب كائن المستخدم الكامل (من قاعدة البيانات)  يُستخدم فقط في Server Components
export async function getCurrentUser() {
  try {
    const userId = await getCurrentUserId();
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });
    if (!userData) {
      throw Errors.notFound("المستخدم");
    }
    return userData;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw Errors.internal(error);
  }
}
