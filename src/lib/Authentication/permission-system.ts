import { and, eq } from "drizzle-orm";
import { database } from "@/lib/database";
import {
  permission,
  role,
  rolePermissions,
  userRoles,
} from "@/lib/database/schema";

export interface AccessContext {
  userId: string;
  resource?: string;
  action?: string;
  environment?: Record<string, unknown>;
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

export class AuthorizationService {
  // الحصول على جميع أدوار المستخدم
  async getUserRoles(userId: string): Promise<string[]> {
    const userRolesData = await database
      .select({
        roleName: role.name,
      })
      .from(userRoles)
      .innerJoin(role, eq(userRoles.roleId, role.id))
      .where(eq(userRoles.userId, userId));

    return userRolesData.map((ur: { roleName: string }) => ur.roleName);
  }

  // الحصول على جميع صلاحيات المستخدم
  async getUserPermissions(userId: string): Promise<
    Array<{
      name: string;
      resource: string;
      action: string;
      conditions?: Record<string, unknown>;
    }>
  > {
    const userPermissions = await database
      .select({
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        conditions: permission.conditions,
      })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permission, eq(rolePermissions.permissionId, permission.id))
      .where(eq(userRoles.userId, userId));

    return userPermissions as any;
  }

  // فحص الصلاحية (RBAC + ABAC)
  async checkPermission(
    context: AccessContext,
    requiredPermission: string,
  ): Promise<PermissionCheck> {
    const userPermissions = await this.getUserPermissions(context.userId);

    // البحث عن الصلاحية المطلوبة
    const hasPermission = userPermissions.some(
      (perm) =>
        perm.name === requiredPermission &&
        this.evaluateConditions(perm.conditions, context.environment || {}),
    );

    if (hasPermission) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `User lacks permission: ${requiredPermission}`,
    };
  }

  // فحص القدرة على تنفيذ إجراء على مورد (RBAC + ABAC)
  async canPerformAction(
    context: AccessContext & { resource: string; action: string },
  ): Promise<PermissionCheck> {
    const userPermissions = await this.getUserPermissions(context.userId);

    const hasAccess = userPermissions.some(
      (perm) =>
        perm.resource === context.resource &&
        perm.action === context.action &&
        this.evaluateConditions(perm.conditions, context.environment || {}),
    );

    if (hasAccess) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `User cannot perform ${context.action} on ${context.resource}`,
    };
  }

  // تقييم شروط ABAC
  private evaluateConditions(
    conditions: Record<string, unknown> | null | undefined,
    environment: Record<string, unknown>,
  ): boolean {
    if (!conditions) return true;

    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = environment[key];

      if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  // إدارة الأدوار
  async assignRoleToUser(userId: string, roleName: string): Promise<boolean> {
    const roleData = await database
      .select()
      .from(role)
      .where(eq(role.name, roleName))
      .limit(1);

    if (roleData.length === 0) return false;

    try {
      await database.insert(userRoles).values({
        userId,
        roleId: roleData[0].id,
      });
      return true;
    } catch {
      return false;
    }
  }

  // إزالة دور من مستخدم
  async removeRoleFromUser(userId: string, roleName: string): Promise<boolean> {
    const roleData = await database
      .select()
      .from(role)
      .where(eq(role.name, roleName))
      .limit(1);

    if (roleData.length === 0) return false;

    await database
      .delete(userRoles)
      .where(
        and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleData[0].id)),
      );

    return true;
  }
}

export const authorizationService = new AuthorizationService();
