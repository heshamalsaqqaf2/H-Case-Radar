// src/lib/authorization/actions/admin/role-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { createAuditLog } from "@/lib/authorization/services/admin/audit-log-service";
import {
  assignPermissionsToRole,
  createRole,
  deleteRole,
  getAllRoles,
  getRoleProfileData,
  updateRole,
} from "@/lib/authorization/services/admin/role-service";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import {
  createRoleSchema,
  updateRoleSchema,
} from "@/lib/authorization/validators/admin/role-validator";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import { Errors } from "@/lib/errors/error-factory";

// ─── انشاء دور جديد ───
export async function createRoleAction(input: {
  name: string;
  description: string;
  isDefault: boolean;
}) {
  try {
    const userId = await getCurrentUserId();
    const validatedData = createRoleSchema.parse(input);
    const newRole = await createRole(userId, validatedData);

    await createAuditLog(AUDIT_LOG_ACTIONS.ROLE.CREATE, "role", newRole.id, {
      name: newRole.name,
      description: newRole.description,
      isDefault: newRole.isDefault,
    });

    revalidatePath("/admin/roles");
    return handleSuccess({ message: "تم إنشاء الدور بنجاح", data: newRole });
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── تحديث الأدوار ───
export async function updateRoleAction(input: {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}) {
  try {
    const userId = await getCurrentUserId();
    const validatedData = updateRoleSchema.parse(input);
    const updatedRole = await updateRole(userId, validatedData);

    await createAuditLog(AUDIT_LOG_ACTIONS.ROLE.UPDATE, "role", updatedRole.id, {
      name: updatedRole.name,
      description: updatedRole.description,
      isDefault: updatedRole.isDefault,
    });
    revalidatePath("/admin/roles");
    return handleSuccess({
      message: "تم تحديث الدور بنجاح",
      data: updatedRole,
    });
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── حذف الأدوار ───
export async function deleteRoleAction(input: { id: string }) {
  try {
    const userId = await getCurrentUserId();
    await deleteRole(userId, input.id);

    // TODO: Add audit log
    await createAuditLog(AUDIT_LOG_ACTIONS.ROLE.DELETE, "role", input.id, {
      deletedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/roles");
    return handleSuccess({ message: "تم حذف الدور بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── تعيين صلاحيات الأدوار ───
export async function assignPermissionsToRoleAction(input: {
  roleId: string;
  permissionIds: string[];
}) {
  try {
    const userId = await getCurrentUserId();
    await assignPermissionsToRole(userId, input.roleId, input.permissionIds);
    await createAuditLog(AUDIT_LOG_ACTIONS.ROLE.ASSIGN_PERMISSIONS, "role", input.roleId, {
      permissionIds: input.permissionIds,
      assignedBy: userId,
    });

    revalidatePath("/admin/roles");
    return handleSuccess({ message: "تم تعيين الصلاحيات بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── الحصول على جميع الأدوار ───
export async function getAllRolesAction() {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.ROLE.VIEW,
    );

    if (!permissionCheck.allowed) {
      throw Errors.forbidden("عرض الأدوار");
    }

    const roles = await getAllRoles();
    return handleSuccess(roles);
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── الحصول على بيانات الأدوار ───
export async function getRoleProfileDataAction(input: { roleId: string }) {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.ROLE.VIEW,
    );
    if (!permissionCheck.allowed) {
      throw Errors.forbidden("عرض الأدوار");
    }

    const roleData = await getRoleProfileData(input.roleId);
    if (!roleData) {
      throw Errors.notFound("الدور");
    }
    return handleSuccess(roleData);
  } catch (error) {
    return handleFailure(error);
  }
}
