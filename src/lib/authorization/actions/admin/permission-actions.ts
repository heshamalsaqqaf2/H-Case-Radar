// src/lib/authorization/actions/admin/permission-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { authorizationService } from "@/lib/authentication/permission-system";
import { getCurrentUserId } from "@/lib/authentication/session";
import { createAuditLog } from "@/lib/authorization/services/admin/audit-log-service";
import {
  createPermission,
  deletePermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
} from "@/lib/authorization/services/admin/permission-service";
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
    // TODO: Add audit log
    await createAuditLog("permission.create", "permission", permission.id, {
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
    });

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
    // TODO: Add audit log
    await createAuditLog("permission.update", "permission", permission.id, {
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
    });
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
    // TODO: Add audit log
    await createAuditLog("permission.delete", "permission", permissionId, {
      deletedAt: new Date().toISOString(),
    });
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
      "permissions.read",
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
      "permissions.read",
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
