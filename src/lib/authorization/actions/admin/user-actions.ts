// src/lib/authorization/actions/admin/user-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { createAuditLog } from "@/lib/authorization/services/admin/audit-log-service";
import {
  assignRoleToUser,
  createUserWithRoles,
  getCurrentUser,
  getUserStatistics,
  getUsersWithRoles,
  getUsersWithRolesAndPermissions,
  removeRoleFromUser,
  toggleUserBan,
  updateUserProfile,
} from "@/lib/authorization/services/admin/user-service";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import type { CreateUserInput, UpdateUserInput } from "@/lib/authorization/types/user";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import { Errors } from "@/lib/errors/error-factory";

export async function getUsersWithRolesAction() {
  try {
    const userId = await getCurrentUserId();
    const check = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.USER.VIEW, //"user.view"
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

export async function getUsersWithRolesAndPermissionsAction() {
  try {
    const userId = await getCurrentUserId();
    const check = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.USER.VIEW,
    );
    if (!check.allowed) {
      throw Errors.forbidden("عرض المستخدمين");
    }

    const users = await getUsersWithRolesAndPermissions();
    return handleSuccess(users);
  } catch (error) {
    return handleFailure(error);
  }
}

export async function assignRoleToUserAction(input: { userId: string; roleId: string }) {
  try {
    const adminUserId = await getCurrentUserId();

    if (!input.userId || !input.roleId) {
      throw Errors.validation("بيانات غير كافية");
    }

    await assignRoleToUser(adminUserId, input.userId, input.roleId);
    await createAuditLog(AUDIT_LOG_ACTIONS.USER.ASSIGN_ROLE, "user", input.userId, {
      roleId: input.roleId,
      assignedBy: adminUserId,
    });

    revalidatePath("/admin/users");
    return handleSuccess({ message: "تم تعيين الدور بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function removeRoleFromUserAction(input: { userId: string; roleId: string }) {
  try {
    const adminUserId = await getCurrentUserId();

    if (!input.userId || !input.roleId) {
      throw Errors.validation("بيانات غير كافية");
    }

    await removeRoleFromUser(adminUserId, input.userId, input.roleId);
    await createAuditLog(AUDIT_LOG_ACTIONS.USER.REMOVE_ROLE, "user", input.userId, {
      roleId: input.roleId,
      removedBy: adminUserId,
    });

    revalidatePath("/admin/users");
    return handleSuccess({ message: "تم إزالة الدور بنجاح" });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function getCurrentUserAction() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return handleFailure(new Error("User not authenticated"));
    }

    const user = await getCurrentUser(userId);
    return handleSuccess(user);
  } catch (error) {
    return handleFailure(error);
  }
}

export async function updateUserProfileAction(input: {
  targetUserId: string;
  updates: UpdateUserInput;
}) {
  try {
    const adminUserId = await getCurrentUserId();

    const updatedUser = await updateUserProfile(adminUserId, input.targetUserId, input.updates);

    await createAuditLog(AUDIT_LOG_ACTIONS.USER.UPDATE, "user", input.targetUserId, {
      updatedFields: Object.keys(input.updates),
      updatedBy: adminUserId,
    });

    revalidatePath("/admin/users");
    return handleSuccess({
      message: "تم تحديث المستخدم بنجاح",
      data: updatedUser,
    });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function toggleUserBanAction(input: {
  targetUserId: string;
  ban: boolean;
  reason?: string;
}) {
  try {
    const adminUserId = await getCurrentUserId();

    const updatedUser = await toggleUserBan(
      adminUserId,
      input.targetUserId,
      input.ban,
      input.reason,
    );

    await createAuditLog(
      input.ban ? AUDIT_LOG_ACTIONS.USER.BAN : AUDIT_LOG_ACTIONS.USER.UNBAN,
      "user",
      input.targetUserId,
      {
        banned: input.ban,
        reason: input.reason,
        actionBy: adminUserId,
      },
    );

    revalidatePath("/admin/users");
    return handleSuccess({
      message: input.ban ? "تم حظر المستخدم بنجاح" : "تم فك حظر المستخدم بنجاح",
      data: updatedUser,
    });
  } catch (error) {
    return handleFailure(error);
  }
}

export async function getUserStatisticsAction(input: { userId: string }) {
  try {
    const userId = await getCurrentUserId();
    const check = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.STATISTICS.VIEW,
    );

    if (!check.allowed) {
      throw Errors.forbidden("عرض إحصائيات المستخدم");
    }

    const statistics = await getUserStatistics(input.userId);
    return handleSuccess(statistics);
  } catch (error) {
    return handleFailure(error);
  }
}

// ✅ Action
export async function createUserAction(input: CreateUserInput) {
  try {
    const adminUserId = await getCurrentUserId();
    const result = await createUserWithRoles(adminUserId, input);

    await createAuditLog(AUDIT_LOG_ACTIONS.USER.CREATE, "user", result.user.id, {
      createdBy: adminUserId,
      assignedRoles: input.roleIds,
      sendWelcomeEmail: input.sendWelcomeEmail,
    });

    revalidatePath("/admin/users");
    return handleSuccess({
      message: "تم إنشاء المستخدم بنجاح",
      data: result,
    });
  } catch (error) {
    return handleFailure(error);
  }
}
