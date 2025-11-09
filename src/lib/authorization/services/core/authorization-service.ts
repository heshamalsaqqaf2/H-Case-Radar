import { and, eq } from "drizzle-orm";
import type {
  AccessContext,
  PermissionCheck,
  SafePermission,
} from "@/lib/authorization/types/authorization";
import { permission, role, rolePermissions, userRoles } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";

/**
 * خدمة مركزية لإدارة التفويض (Authorization) تدعم:
 * - RBAC: عبر الأدوار والصلاحيات
 * - ABAC: عبر شروط بيئة (environment conditions)
 */
export class AuthorizationService {
  /**
   * جلب أسماء الأدوار المرتبطة بمستخدم معين
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const userRolesData = await db
      .select({ roleName: role.name })
      .from(userRoles)
      .innerJoin(role, eq(userRoles.roleId, role.id))
      .where(eq(userRoles.userId, userId));

    return userRolesData.map((ur) => ur.roleName);
  }

  /**
   * تعيين دور لمستخدم
   * @returns true إذا نجح التعيين، false إذا فشل (الدور غير موجود أو انتهاك قيود فريدة)
   */
  async assignRoleToUser(userId: string, roleName: string): Promise<boolean> {
    const roleData = await db
      .select({ id: role.id })
      .from(role)
      .where(eq(role.name, roleName))
      .limit(1);

    if (roleData.length === 0) return false;

    try {
      await db.insert(userRoles).values({
        userId,
        roleId: roleData[0].id,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * إزالة دور من مستخدم
   * @returns true إذا تم الحذف، false إذا كان الدور غير موجود
   */
  async removeRoleFromUser(userId: string, roleName: string): Promise<boolean> {
    const roleData = await db
      .select({ id: role.id })
      .from(role)
      .where(eq(role.name, roleName))
      .limit(1);

    if (roleData.length === 0) return false;

    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleData[0].id)));

    return true;
  }

  /**
   * جلب جميع الصلاحيات المرتبطة بمستخدم (عبر أدواره)
   */
  async getUserPermissions(userId: string): Promise<SafePermission[]> {
    const rawPermissions = await db
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

    return rawPermissions.map((perm) => ({
      name: perm.name,
      resource: perm.resource,
      action: perm.action,
      conditions:
        typeof perm.conditions === "object" &&
        perm.conditions !== null &&
        !Array.isArray(perm.conditions)
          ? (perm.conditions as Record<string, unknown>)
          : null,
    }));
  }

  /**
   * التحقق من وجود صلاحية باسم محدد (RBAC + ABAC)
   */
  async checkPermission(
    context: AccessContext,
    requiredPermission: string,
  ): Promise<PermissionCheck> {
    const userPermissions = await this.getUserPermissions(context.userId);

    const hasPermission = userPermissions.some(
      (perm) =>
        perm.name === requiredPermission &&
        this.evaluateConditions(perm.conditions, context.environment ?? {}),
    );

    if (hasPermission) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `User lacks required permission: "${requiredPermission}"`,
    };
  }

  /**
   * التحقق من القدرة على تنفيذ إجراء على مورد محدد (ABAC محوره resource/action)
   */
  async canPerformAction(
    context: Required<Pick<AccessContext, "userId" | "resource" | "action">> & {
      environment?: Record<string, unknown>;
    },
  ): Promise<PermissionCheck> {
    const userPermissions = await this.getUserPermissions(context.userId);

    const hasAccess = userPermissions.some(
      (perm) =>
        perm.resource === context.resource &&
        perm.action === context.action &&
        this.evaluateConditions(perm.conditions, context.environment ?? {}),
    );

    if (hasAccess) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `User cannot perform "${context.action}" on resource "${context.resource}"`,
    };
  }

  /**
   * تقييم شروط ABAC مقابل بيئة التشغيل
   * يدعم فقط المطابقة الصارمة (===) حاليًا
   */
  private evaluateConditions(
    conditions: Record<string, unknown> | null | undefined,
    environment: Record<string, unknown>,
  ): boolean {
    if (!conditions) return true;

    for (const [key, expectedValue] of Object.entries(conditions)) {
      if (environment[key] !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  // !!!!دوال جديدة للاختبار
  async getUserRolesWithDetails(userId: string): Promise<Array<{ id: string; name: string }>> {
    const userRolesData = await db
      .select({
        id: role.id,
        name: role.name,
      })
      .from(userRoles)
      .innerJoin(role, eq(userRoles.roleId, role.id))
      .where(eq(userRoles.userId, userId));

    return userRolesData;
  }

  async getRolePermissions(roleId: string): Promise<Array<{ name: string }>> {
    const permissions = await db
      .select({
        name: permission.name,
      })
      .from(rolePermissions)
      .innerJoin(permission, eq(rolePermissions.permissionId, permission.id))
      .where(eq(rolePermissions.roleId, roleId));

    return permissions;
  }

  async debugUserRoles(userId: string) {
    try {
      // جلب أدوار المستخدم مع التفاصيل
      const userRoles = await this.getUserRolesWithDetails(userId);
      console.log("👤 User Roles:", userRoles);

      // جلب صلاحيات كل دور
      const rolesWithPermissions = await Promise.all(
        userRoles.map(async (role) => {
          const permissions = await this.getRolePermissions(role.id);
          return {
            role: role.name,
            permissions: permissions.map((p) => p.name),
          };
        }),
      );

      console.log("🔐 Roles with Permissions:", rolesWithPermissions);
      return { userRoles, rolesWithPermissions };
    } catch (error) {
      console.error("Error in debugUserRoles:", error);
      throw error;
    }
  }
}

/**
 * مثيل عالمي (singleton) للخدمة — آمن للاستخدام في Server Components/Actions
 */
export const authorizationService = new AuthorizationService();
