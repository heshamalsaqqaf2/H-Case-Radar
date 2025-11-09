// src/lib/authorization/actions/admin/permission-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { createAuditLog } from "@/lib/authorization/services/admin/audit-log-service";
import {
  createPermission,
  deletePermission,
  getAllPermissions,
  getCurrentUserPermissions,
  getPermissionById,
  updatePermission,
} from "@/lib/authorization/services/admin/permission-service";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "@/lib/authorization/validators/admin/permission-validator";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import { Errors } from "@/lib/errors/error-factory";

export async function createPermissionAction(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const validatedData = createPermissionSchema.parse({
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? undefined,
      resource: formData.get("resource")?.toString() ?? "",
      action: formData.get("action")?.toString() ?? "",
      conditions: formData.get("conditions")?.toString() ?? undefined,
    });

    const permission = await createPermission(userId, validatedData);
    await createAuditLog(
      AUDIT_LOG_ACTIONS.PERMISSION.CREATE,
      "permission",
      permission.id,
      {
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
      },
    );

    revalidatePath("/admin/permissions");
    return handleSuccess({ message: "تم إنشاء الصلاحية بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function updatePermissionAction(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const validatedData = updatePermissionSchema.parse({
      id: formData.get("id")?.toString() ?? "",
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? undefined,
      resource: formData.get("resource")?.toString() ?? "",
      action: formData.get("action")?.toString() ?? "",
      conditions: formData.get("conditions")?.toString() ?? undefined,
    });

    const permission = await updatePermission(userId, validatedData);
    await createAuditLog(
      AUDIT_LOG_ACTIONS.PERMISSION.UPDATE,
      "permission",
      permission.id,
      {
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
      },
    );
    revalidatePath("/admin/permissions");
    return handleSuccess({ message: "تم تحديث الصلاحية بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function deletePermissionAction(permissionId: string) {
  try {
    const userId = await getCurrentUserId();
    await deletePermission(userId, permissionId);
    await createAuditLog(
      AUDIT_LOG_ACTIONS.PERMISSION.DELETE,
      "permission",
      permissionId,
      {
        deletedAt: new Date().toISOString(),
      },
    );
    revalidatePath("/admin/permissions");
    return handleSuccess({ message: "تم حذف الصلاحية بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function getPermissionByIdAction(permissionId: string) {
  try {
    const userId = await getCurrentUserId();
    const check = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.PERMISSION.VIEW,
    );
    if (!check.allowed) {
      throw Errors.forbidden("عرض الصلاحيات");
    }

    const permission = await getPermissionById(permissionId);
    if (!permission) {
      throw Errors.notFound("الصلاحية");
    }
    return handleSuccess(permission);
  } catch (error) {
    return handleFailure(error);
  }
}

export async function getAllPermissionsAction() {
  try {
    const userId = await getCurrentUserId();
    const check = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.PERMISSION.ACCESS,
    );
    if (!check.allowed) {
      throw Errors.forbidden("عرض الصلاحيات");
    }

    const permissions = await getAllPermissions();
    return handleSuccess(permissions);
  } catch (error) {
    return handleFailure(error);
  }
}

// الحصول على صلاحيات المستخدم الحالي
export async function getCurrentUserPermissionsAction() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return handleFailure(new Error("User not authenticated"));
    }

    const permissions = await getCurrentUserPermissions(userId);
    return handleSuccess(permissions);
  } catch (error) {
    return handleFailure(error);
  }
}
