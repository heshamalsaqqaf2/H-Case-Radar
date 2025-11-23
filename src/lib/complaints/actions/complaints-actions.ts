"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { createAuditLog } from "@/lib/authorization/services/admin/audit-log-service";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import { addComment, ComplaintService } from "@/lib/complaints/services/complaints-service";
import type { ComplaintEscalationLevelType } from "@/lib/complaints/types/type-complaints";
import {
  createComplaintSchema,
  updateComplaintSchema,
} from "@/lib/complaints/validators/complaint-validator";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import { Errors } from "@/lib/errors/error-factory";

type CreateComplaintInput = import("@/lib/complaints/types/type-complaints").CreateComplaintInput;
type UpdateComplaintInput = import("@/lib/complaints/types/type-complaints").UpdateComplaintInput;

// ─── Create ───
export async function createComplaintAction(input: CreateComplaintInput) {
  try {
    const userId = await getCurrentUserId();
    const validated = createComplaintSchema.parse(input);
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.CREATE,
    );

    if (!permissionCheck.allowed) throw Errors.forbidden("إنشاء الشكاوى");

    const newComplaint = await ComplaintService.createComplaint(userId, validated);
    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.CREATE, "complaint", newComplaint.id, {
      title: newComplaint.title,
      category: newComplaint.category,
      priority: newComplaint.priority,
      source: newComplaint.source,
      submittedBy: userId,
      assignedTo: newComplaint.assignedTo,
    });

    revalidatePath("/admin/complaints");
    revalidatePath("/dashboard");
    return handleSuccess({ message: "تم إنشاء الشكوى بنجاح", data: newComplaint });
  } catch (error) {
    // === DEBUGGING CODE - أضف هذا الجزء ===
    console.error("=== RAW ERROR IN CreateComplaintsAction ===");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    console.error("=== END RAW ERROR ===");
    // === END DEBUGGING CODE ===
    return handleFailure(error);
  }
}

// ─── Update ───
export async function updateComplaintAction(input: UpdateComplaintInput) {
  try {
    const userId = await getCurrentUserId();
    const validated = updateComplaintSchema.parse(input);

    // Check permission
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("تحديث الشكاوى");

    // get complaint before update
    const complaintBeforeUpdate = await ComplaintService.getComplaintById(validated.id);
    if (complaintBeforeUpdate?.status === "closed") throw Errors.badRequest("الشكاوى مغلقة");


    // Update complaint
    const updated = await ComplaintService.updateComplaint(userId, validated);
    // Create audit log
    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "complaint", updated.id, {
      changedFields: Object.keys(validated).filter((k) => k !== "id"),
      id: updated.id,
      updatedBy: userId,
      title: updated.title,
      category: updated.category,
      priority: updated.priority,
      source: updated.source,
    });

    revalidatePath("/admin/complaints");
    revalidatePath(`/admin/complaints/${updated.id}`);
    return handleSuccess({ message: "تم تحديث الشكوى بنجاح", data: updated });
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── Assign ───
export async function assignComplaintAction(input: { complaintId: string; assignedTo: string }) {
  try {
    const userId = await getCurrentUserId();

    // Check permission
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.ASSIGN,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("تعيين الشكاوى");

    const updated = await ComplaintService.assignComplaint(userId, input.complaintId, input.assignedTo);

    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.ASSIGN, "complaint", input.complaintId, {
      assignedTo: input.assignedTo,
      assignedBy: userId,
    });

    revalidatePath("/admin/complaints");
    revalidatePath(`/admin/complaints/${input.complaintId}`);
    return handleSuccess({ message: "تم تعيين الشكوى بنجاح", data: updated });
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── Resolve ───
export async function resolveComplaintAction(input: { complaintId: string; resolutionNotes?: string }) {
  try {
    const userId = await getCurrentUserId();

    // Check permission
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.RESOLVE,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("حل الشكاوى");

    const updated = await ComplaintService.resolveComplaint(
      userId,
      input.complaintId,
      input.resolutionNotes || "تم حل البلاغ بنجاح.",
    );

    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.RESOLVE, "complaint", input.complaintId, {
      resolvedBy: userId,
      resolutionNotes: input.resolutionNotes,
      resolvedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/complaints");
    revalidatePath(`/admin/complaints/${input.complaintId}`);
    return handleSuccess({ message: "تم حل الشكوى بنجاح", data: updated });
  } catch (error) {
    // === DEBUGGING CODE - أضف هذا الجزء ===
    console.error("=== RAW ERROR IN resolveComplaintAction ===");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    console.error("=== END RAW ERROR ===");
    // === END DEBUGGING CODE ===
    return handleFailure(error);
  }
}

// ─── Close ───
export async function closeComplaintAction(input: { complaintId: string }) {
  try {
    const userId = await getCurrentUserId();

    // Check permission
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.CLOSE,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("إغلاق الشكاوى");

    const updated = await ComplaintService.closeComplaint(userId, input.complaintId);

    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.CLOSE, "complaint", input.complaintId, {
      closedBy: userId,
      closedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/complaints");
    revalidatePath(`/admin/complaints/${input.complaintId}`);
    return handleSuccess({ message: "تم إغلاق الشكوى بنجاح", data: updated });
  } catch (error) {
    // === DEBUGGING CODE - أضف هذا الجزء ===
    console.error("=== RAW ERROR IN closeComplaintAction ===");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    console.error("=== END RAW ERROR ===");
    // === END DEBUGGING CODE ===
    return handleFailure(error);
  }
}

// ─── Reopen ───
export async function reopenComplaintAction(input: { complaintId: string; reason: string }) {
  try {
    const userId = await getCurrentUserId();

    // Check permission
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("إعادة فتح الشكاوى");

    const updated = await ComplaintService.reopenComplaint(userId, input.complaintId, input.reason);

    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "complaint", input.complaintId, {
      action: "reopened",
      reason: input.reason,
      reopenedBy: userId,
      reopenedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/complaints");
    revalidatePath(`/admin/complaints/${input.complaintId}`);
    return handleSuccess({ message: "تم إعادة فتح الشكوى بنجاح", data: updated });
  } catch (error) {
    // === DEBUGGING CODE - أضف هذا الجزء ===
    console.error("=== RAW ERROR IN reopenComplaintAction ===");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    console.error("=== END RAW ERROR ===");
    // === END DEBUGGING CODE ===
    return handleFailure(error);
  }
}

// ─── Escalate ───
export async function escalateComplaintAction(input: {
  complaintId: string;
  level: ComplaintEscalationLevelType;
}) {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("تصعيد الشكاوى");

    const updated = await ComplaintService.escalateComplaint(userId, input.complaintId, input.level);
    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "complaint", input.complaintId, {
      action: "escalated",
      level: input.level,
      escalatedBy: userId,
      escalatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/complaints");
    revalidatePath(`/admin/complaints/${input.complaintId}`);
    return handleSuccess({ message: "تم تصعيد الشكوى بنجاح", data: updated });
  } catch (error) {
    // === DEBUGGING CODE - أضف هذا الجزء ===
    console.error("=== RAW ERROR IN escalateComplaintAction ===");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    console.error("=== END RAW ERROR ===");
    // === END DEBUGGING CODE ===
    return handleFailure(error);
  }
}

// ─── Update Escalation Level ───
export async function updateEscalationLevelComplaintAction(input: {
  complaintId: string;
  level: ComplaintEscalationLevelType;
}) {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("تصعيد الشكاوى");

    const updated = await ComplaintService.updateEscalationLevel(userId, input.complaintId, input.level);
    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "complaint", input.complaintId, {
      action: "escalated",
      level: input.level,
      escalatedBy: userId,
      escalatedAt: new Date().toISOString(),
    });
    revalidatePath("/admin/complaints");
    revalidatePath(`/admin/complaints/${input.complaintId}`);
    return handleSuccess({ message: "تم تحديث مستوى التصعيد بنجاح", data: updated });
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── Delete ───
export async function deleteComplaintAction(input: { id: string }) {
  try {
    const userId = await getCurrentUserId();

    // Check permission
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.DELETE,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("حذف الشكاوى");

    await ComplaintService.deleteComplaint(userId, input.id);

    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.DELETE, "complaint", input.id, {
      deletedBy: userId,
      deletedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/complaints");
    return handleSuccess({ message: "تم حذف الشكوى بنجاح" });
  } catch (error) {
    // === DEBUGGING CODE - أضف هذا الجزء ===
    console.error("=== RAW ERROR IN deleteComplaintAction ===");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    console.error("=== END RAW ERROR ===");
    // === END DEBUGGING CODE ===
    return handleFailure(error);
  }
}

// ─── List ───
export async function getAllComplaintsAction(
  search?: string,
  status?: string,
  priority?: string,
  category?: string,
  tags?: string[],
  pageSize = 10,
  cursor?: string,
) {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("عرض الشكاوى");

    const result = await ComplaintService.listComplaints(
      search,
      status,
      priority,
      category,
      tags,
      pageSize,
      cursor,
    );
    return handleSuccess(result);
  } catch (error) {
    console.error("=== RAW ERROR IN getAllComplaintsAction ===");
    console.error(error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    console.error("=== END RAW ERROR ===");
    return handleFailure(error);
  }
}

// ─── Stats ───
export async function getComplaintStatsAction() {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.VIEW_STATISTICS,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("عرض إحصائيات الشكاوى");

    const stats = await ComplaintService.getComplaintStats();
    return handleSuccess(stats);
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── Profile ───
export async function getComplaintProfileDataAction(input: { complaintId: string }) {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("عرض الشكوى");

    const profile = await ComplaintService.getComplaintProfileData(input.complaintId);
    if (!profile) return handleFailure(Errors.notFound("الشكوى"));
    return handleSuccess(profile);
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── Get single complaint ───
export async function getComplaintByIdAction(input: { complaintId: string }) {
  try {
    const userId = await getCurrentUserId();
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("عرض الشكوى");

    const complaint = await ComplaintService.getComplaintById(input.complaintId);
    if (!complaint) return handleFailure(Errors.notFound("الشكوى"));
    return handleSuccess(complaint);
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── Add comment action ───
export async function addCommentAction(input: { complaintId: string; body: string }) {
  try {
    const userId = await getCurrentUserId();
    // Check permission for commenting
    const perm = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.COMPLAINT_COMMENT.ADD,
    );
    if (!perm.allowed) throw Errors.forbidden("إضافة تعليق");

    const comment = await addComment(input.complaintId, userId, input.body);
    await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.COMPLAINT_COMMENT.ADD, "complaint", input.complaintId, {
      commentId: comment.id,
      author: userId,
    });
    revalidatePath(`/admin/complaints/${input.complaintId}`);
    return handleSuccess({ message: "تم إضافة التعليق", data: comment });
  } catch (error) {
    return handleFailure(error);
  }
}

// ─── Get Assignable Users ───
export async function getAssignableUsersAction() {
  try {
    const userId = await getCurrentUserId();

    // Check permission: either ASSIGN or USER.VIEW
    const [assignCheck, viewCheck] = await Promise.all([
      authorizationService.checkPermission({ userId }, AUDIT_LOG_ACTIONS.COMPLAINT.ASSIGN),
      authorizationService.checkPermission({ userId }, AUDIT_LOG_ACTIONS.USER.VIEW),
    ]);

    if (!assignCheck.allowed && !viewCheck.allowed) {
      throw Errors.forbidden("عرض المستخدمين");
    }

    const users = await ComplaintService.getAssignableUsers();
    return handleSuccess(users);
  } catch (error) {
    return handleFailure(error);
  }
}

