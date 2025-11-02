// src/lib/authorization/actions/admin/user-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { authorizationService } from "@/lib/authentication/permission-system";
import { getCurrentUserId } from "@/lib/authentication/session";
import { createAuditLog } from "@/lib/authorization/services/admin/audit-log-service";
import {
  assignRoleToUser,
  getUsersWithRoles,
  removeRoleFromUser,
} from "@/lib/authorization/services/admin/user-service";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import { Errors } from "@/lib/errors/error-factory";

export async function getUsersWithRolesAction() {
  try {
    const userId = await getCurrentUserId();
    const check = await authorizationService.checkPermission(
      { userId },
      "users.read",
    );
    if (!check.allowed) {
      throw Errors.forbidden("عرض المستخدمين");
    }

    const users = await getUsersWithRoles();
    return handleSuccess(users);
  } catch (error) {
    return handleFailure(error);
  }
}

export async function assignRoleToUserAction(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const targetUserId = formData.get("userId")?.toString() ?? "";
    const roleId = formData.get("roleId")?.toString() ?? "";

    if (!targetUserId || !roleId) {
      throw Errors.validation("بيانات غير كافية");
    }

    await assignRoleToUser(userId, targetUserId, roleId);
    // TODO: Add audit log
    await createAuditLog("role.assign", "user", targetUserId, {
      roleId,
      assignedBy: userId,
    });
    revalidatePath("/admin/users");
    return handleSuccess({ message: "تم تعيين الدور بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function removeRoleFromUserAction(formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const targetUserId = formData.get("userId")?.toString() ?? "";
    const roleId = formData.get("roleId")?.toString() ?? "";

    if (!targetUserId || !roleId) {
      throw Errors.validation("بيانات غير كافية");
    }

    await removeRoleFromUser(userId, targetUserId, roleId);
    // TODO: Add audit log
    await createAuditLog("role.remove", "user", targetUserId, {
      roleId,
      removedBy: userId,
    });
    revalidatePath("/admin/users");
    return handleSuccess({ message: "تم إزالة الدور بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}
