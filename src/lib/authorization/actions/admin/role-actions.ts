// src/lib/authorization/actions/admin/role-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { authorizationService } from "@/lib/authentication/permission-system";
import { getCurrentUserId } from "@/lib/authentication/session";
import { createAuditLog } from "@/lib/authorization/services/admin/audit-log-service";
import {
  assignPermissionsToRole,
  createRole,
  deleteRole,
  getRoleProfileData,
  updateRole,
} from "@/lib/authorization/services/admin/role-service";
import {
  createRoleSchema,
  updateRoleSchema,
} from "@/lib/authorization/validators/admin/role-validator";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import { Errors } from "@/lib/errors/error-factory";

export async function createRoleAction(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const validatedData = createRoleSchema.parse({
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      isDefault: formData.get("isDefault") === "on",
    });

    const role = await createRole(userId, validatedData);
    // TODO: Add audit log
    await createAuditLog("role.create", "role", createdRole.id, {
      name: role.name,
      description: role.description,
      isDefault: role.isDefault,
    });

    revalidatePath("/admin/roles");
    return handleSuccess({ message: "تم إنشاء الدور بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function updateRoleAction(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const validatedData = updateRoleSchema.parse({
      id: formData.get("id")?.toString() ?? "",
      name: formData.get("name")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      isDefault: formData.get("isDefault") === "on",
    });

    const role = await updateRole(userId, validatedData);
    // TODO: Add audit log
    await createAuditLog("role.update", "role", role.id, {
      name: role.name,
      description: role.description,
      isDefault: role.isDefault,
    });
    revalidatePath("/admin/roles");
    return handleSuccess({ message: "تم تحديث الدور بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function deleteRoleAction(roleId: string) {
  try {
    const userId = await getCurrentUserId();
    await deleteRole(userId, roleId);

    // TODO: Add audit log
    await createAuditLog("role.delete", "role", roleId, {
      deletedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/roles");
    return handleSuccess({ message: "تم حذف الدور بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function assignPermissionsToRoleAction(
  roleId: string,
  permissionIds: string[],
) {
  try {
    const userId = await getCurrentUserId();
    await assignPermissionsToRole(userId, roleId, permissionIds);

    // TODO: Add audit log
    await createAuditLog("permission.grant", "role", roleId, {
      permissionIds,
      assignedBy: userId,
    });

    revalidatePath("/admin/roles");
    return handleSuccess({ message: "تم تعيين الصلاحيات بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function getRoleProfileDataAction(roleId: string) {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      "roles.read",
    );
    if (!permissionCheck.allowed) {
      throw Errors.forbidden("عرض الأدوار");
    }

    const roleData = await getRoleProfileData(roleId);
    if (!roleData) {
      throw Errors.notFound("الدور");
    }
    return handleSuccess(roleData);
  } catch (error) {
    return handleFailure(error);
  }
}
