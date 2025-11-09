/**
 * سياق طلب الوصول — يُستخدم في تقييم سياسات ABAC
 */
export interface AccessContext {
  userId: string;
  resource?: string;
  action?: string;
  environment?: Record<string, unknown>;
}

/**
 * نتيجة فحص الصلاحية
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * تمثيل الصلاحية الآمن بعد استخراجها من قاعدة البيانات
 */
export interface SafePermission {
  name: string;
  resource: string;
  action: string;
  conditions: Record<string, unknown> | null;
}

// // lib/authorization/permission-system.ts
// import { and, eq } from "drizzle-orm";
// import { database as db } from "@/lib/database/index";
// import {
//   permission,
//   role,
//   rolePermissions,
//   userRoles,
// } from "@/lib/database/schema";

// export interface AccessContext {
//   userId: string;
//   resource?: string;
//   action?: string;
//   environment?: Record<string, unknown>;
// }
// export interface PermissionCheck {
//   allowed: boolean;
//   reason?: string;
// }
// // النوع الآمن بعد التحويل
// export interface SafePermission {
//   name: string;
//   resource: string;
//   action: string;
//   conditions: Record<string, unknown> | null;
// }
// // نوع الصلاحية كما يرجعه Drizzle ORM
// interface RawPermission {
//   name: string;
//   resource: string;
//   action: string;
//   conditions: unknown; // comes from jsonb column
// }

// export class AuthorizationService {
//   async getUserRoles(userId: string): Promise<string[]> {
//     const userRolesData = await db
//       .select({
//         roleName: role.name,
//       })
//       .from(userRoles)
//       .innerJoin(role, eq(userRoles.roleId, role.id))
//       .where(eq(userRoles.userId, userId));

//     return userRolesData.map((ur) => ur.roleName);
//   }

//   async assignRoleToUser(userId: string, roleName: string): Promise<boolean> {
//     const roleData = await db
//       .select()
//       .from(role)
//       .where(eq(role.name, roleName))
//       .limit(1);

//     if (roleData.length === 0) return false;

//     try {
//       await db.insert(userRoles).values({
//         userId,
//         roleId: roleData[0].id,
//       });
//       return true;
//     } catch {
//       return false;
//     }
//   }

//   async removeRoleFromUser(userId: string, roleName: string): Promise<boolean> {
//     const roleData = await db
//       .select()
//       .from(role)
//       .where(eq(role.name, roleName))
//       .limit(1);

//     if (roleData.length === 0) return false;

//     await db
//       .delete(userRoles)
//       .where(
//         and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleData[0].id)),
//       );

//     return true;
//   }

//   async getUserPermissions(userId: string): Promise<SafePermission[]> {
//     const rawPermissions: RawPermission[] = await db
//       .select({
//         name: permission.name,
//         resource: permission.resource,
//         action: permission.action,
//         conditions: permission.conditions,
//       })
//       .from(userRoles)
//       .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
//       .innerJoin(permission, eq(rolePermissions.permissionId, permission.id))
//       .where(eq(userRoles.userId, userId));

//     // تحويل الـ conditions من unknown إلى Record<string, unknown> | null
//     return rawPermissions.map((perm) => ({
//       name: perm.name,
//       resource: perm.resource,
//       action: perm.action,
//       conditions:
//         typeof perm.conditions === "object" &&
//         perm.conditions !== null &&
//         !Array.isArray(perm.conditions)
//           ? (perm.conditions as Record<string, unknown>)
//           : null,
//     }));
//   }

//   async checkPermission(
//     context: AccessContext,
//     requiredPermission: string,
//   ): Promise<PermissionCheck> {
//     const userPermissions = await this.getUserPermissions(context.userId);

//     const hasPermission = userPermissions.some(
//       (perm) =>
//         perm.name === requiredPermission &&
//         this.evaluateConditions(perm.conditions, context.environment || {}),
//     );
//     if (hasPermission) {
//       return { allowed: true };
//     }
//     return {
//       allowed: false,
//       reason: `User lacks permission: ${requiredPermission}`,
//     };
//   }

//   async canPerformAction(
//     context: AccessContext & { resource: string; action: string },
//   ): Promise<PermissionCheck> {
//     const userPermissions = await this.getUserPermissions(context.userId);

//     const hasAccess = userPermissions.some(
//       (perm) =>
//         perm.resource === context.resource &&
//         perm.action === context.action &&
//         this.evaluateConditions(perm.conditions, context.environment || {}),
//     );

//     if (hasAccess) {
//       return { allowed: true };
//     }

//     return {
//       allowed: false,
//       reason: `User cannot perform ${context.action} on ${context.resource}`,
//     };
//   }

//   private evaluateConditions(
//     conditions: Record<string, unknown> | null | undefined,
//     environment: Record<string, unknown>,
//   ): boolean {
//     if (!conditions) return true;

//     for (const [key, expectedValue] of Object.entries(conditions)) {
//       const actualValue = environment[key];
//       if (actualValue !== expectedValue) {
//         return false;
//       }
//     }
//     return true;
//   }
// }

// export const authorizationService = new AuthorizationService();
