// src/lib/authorization/services/admin/permission-service.ts
import { eq, sql } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import type { SafePermission } from "@/lib/authorization/types/permission";
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "@/lib/authorization/validators/admin/permission-validator";
import { permission, rolePermissions } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";
import { Errors } from "@/lib/errors/error-factory";
import { AppError } from "@/lib/errors/error-types";

// *تحقق من الصلاحية باستخدام نظامك RBAC/ABAC
async function authorize(userId: string, requiredPermission: string) {
  const check = await authorizationService.checkPermission({ userId }, requiredPermission);
  if (!check.allowed) {
    throw Errors.forbidden("إدارة الصلاحيات");
  }
}

// *تحليل شروط JSON بأمان
function parseConditions(conditionsStr?: string): Record<string, unknown> | null {
  if (!conditionsStr) return null;
  try {
    const parsed = JSON.parse(conditionsStr);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed;
    }
    throw new Error("Conditions must be a JSON object");
  } catch {
    throw Errors.validation("الشروط يجب أن تكون كائن JSON صالح");
  }
}

export async function createPermission(userId: string, input: CreatePermissionInput) {
  await authorize(userId, AUDIT_LOG_ACTIONS.PERMISSION.CREATE);

  const existing = await db
    .select({ id: permission.id })
    .from(permission)
    .where(eq(permission.name, input.name))
    .limit(1);

  if (existing.length > 0) {
    throw Errors.conflict("إسم الصلاحية موجود بالفعل");
  }

  const conditions = parseConditions(input.conditions);
  const [newPermission] = await db
    .insert(permission)
    .values({
      name: input.name,
      description: input.description || null,
      resource: input.resource,
      action: input.action,
      conditions,
    })
    .returning();

  return newPermission;
}

export async function updatePermission(userId: string, input: UpdatePermissionInput) {
  await authorize(userId, AUDIT_LOG_ACTIONS.PERMISSION.UPDATE);

  const existing = await db
    .select({ id: permission.id })
    .from(permission)
    .where(eq(permission.name, input.name))
    .limit(1);

  if (existing.length > 0 && existing[0].id !== input.id) {
    throw Errors.conflict("اسم الصلاحية موجود بالفعل, يرجى تغيير الاسم");
  }

  const conditions = parseConditions(input.conditions);
  const [updated] = await db
    .update(permission)
    .set({
      name: input.name,
      description: input.description || null,
      resource: input.resource,
      action: input.action,
      conditions,
      updatedAt: new Date(),
    })
    .where(eq(permission.id, input.id))
    .returning();

  if (!updated) throw Errors.notFound("الصلاحية");
  return updated;
}

export async function deletePermission(userId: string, permissionId: string) {
  await authorize(userId, AUDIT_LOG_ACTIONS.PERMISSION.DELETE);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rolePermissions)
    .where(eq(rolePermissions.permissionId, permissionId));

  if (count > 0) {
    throw Errors.conflict(
      "لا يمكن حذف الصلاحية المرتبطة الى الأدوار, يجب حذف الأدوار المرتبطة بهذه الصلاحية اولا",
    );
  }
  await db.delete(permission).where(eq(permission.id, permissionId));
}

export async function getPermissionById(permissionId: string): Promise<SafePermission | null> {
  const result = await db.select().from(permission).where(eq(permission.id, permissionId)).limit(1);

  if (result.length === 0) return null;

  const raw = result[0];
  const conditions =
    typeof raw.conditions === "object" && raw.conditions !== null && !Array.isArray(raw.conditions)
      ? (raw.conditions as Record<string, unknown>)
      : null;

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    resource: raw.resource,
    action: raw.action,
    conditions,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function getAllPermissions() {
  return await db.select().from(permission).orderBy(permission.resource, permission.action);
}

export async function getCurrentUserPermissions(_userId: string) {
  try {
    const userId = await getCurrentUserId();
    return await authorizationService.getUserPermissions(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw Errors.internal(error);
  }
}
