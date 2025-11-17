// // src/lib/complaints/actions/complaint-actions.ts
// "use server";

// import { revalidatePath } from "next/cache";
// import { getCurrentUserId } from "@/lib/authentication/session";
// import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
// import { createAuditLog } from "@/lib/authorization/services/admin/audit-log-service";
// import {
//   assignComplaint,
//   closeComplaint,
//   createComplaint,
//   deleteComplaint,
//   getAllComplaints,
//   getComplaintById,
//   getComplaintProfileData,
//   getComplaintStats,
//   resolveComplaint,
//   updateComplaint,
// } fro./complaint-serviceice";
// import {
//   createComplaintSchema,
//   updateComplaintSchema,
// } from "@/lib/authorization/validators/admin/complaint-validator";
// import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
// import { Errors } from "@/lib/errors/error-factory";
// import { authorizationService } fro../src/lib/authorization/services/core/authorization-serviceice";
// import type { CreateComplaintInput, UpdateComplaintInput } fro../src/lib/authorization/types/complaintint";

// // ─── إنشاء شكوى جديدة ───
// export async function createComplaintAction(input: CreateComplaintInput) {
//   try {
//     const userId = await getCurrentUserId();
//     const validatedData = createComplaintSchema.parse(input);
//     const newComplaint = await createComplaint(userId, validatedData);

//     await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.CREATE, "complaint", newComplaint.id, {
//       title: newComplaint.title,
//       category: newComplaint.category,
//       priority: newComplaint.priority,
//       source: newComplaint.source,
//       submittedBy: userId,
//     });

//     revalidatePath("/complaints");
//     revalidatePath("/dashboard");
//     return handleSuccess({ message: "تم إنشاء الشكوى بنجاح", data: newComplaint });
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── تحديث الشكوى ───
// export async function updateComplaintAction(input: UpdateComplaintInput) {
//   try {
//     const userId = await getCurrentUserId();
//     const validatedData = updateComplaintSchema.parse(input);
//     const updatedComplaint = await updateComplaint(userId, validatedData);

//     await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "complaint", updatedComplaint.id, {
//       oldStatus: validatedData.status,
//       newStatus: updatedComplaint.status,
//       assignedTo: updatedComplaint.assignedTo,
//       priority: updatedComplaint.priority,
//     });

//     revalidatePath("/complaints");
//     revalidatePath(`/complaints/${updatedComplaint.id}`);
//     return handleSuccess({
//       message: "تم تحديث الشكوى بنجاح",
//       data: updatedComplaint,
//     });
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── تعيين الشكوى ───
// export async function assignComplaintAction(input: { complaintId: string; assignedTo: string }) {
//   try {
//     const userId = await getCurrentUserId();
//     const updatedComplaint = await assignComplaint(userId, input.complaintId, input.assignedTo);

//     await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.ASSIGN, "complaint", input.complaintId, {
//       assignedTo: input.assignedTo,
//       assignedBy: userId,
//     });

//     revalidatePath("/complaints");
//     revalidatePath(`/complaints/${input.complaintId}`);
//     return handleSuccess({
//       message: "تم تعيين الشكوى بنجاح",
//       data: updatedComplaint,
//     });
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── حل الشكوى ───
// export async function resolveComplaintAction(input: { complaintId: string; resolutionNotes?: string }) {
//   try {
//     const userId = await getCurrentUserId();
//     const updatedComplaint = await resolveComplaint(userId, input.complaintId, input.resolutionNotes);

//     await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.RESOLVE, "complaint", input.complaintId, {
//       resolutionNotes: input.resolutionNotes,
//       resolvedBy: userId,
//     });

//     revalidatePath("/complaints");
//     revalidatePath(`/complaints/${input.complaintId}`);
//     return handleSuccess({
//       message: "تم حل الشكوى بنجاح",
//       data: updatedComplaint,
//     });
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── إغلاق الشكوى ───
// export async function closeComplaintAction(input: { complaintId: string }) {
//   try {
//     const userId = await getCurrentUserId();
//     const updatedComplaint = await closeComplaint(userId, input.complaintId);

//     await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.CLOSE, "complaint", input.complaintId, {
//       closedBy: userId,
//     });

//     revalidatePath("/complaints");
//     revalidatePath(`/complaints/${input.complaintId}`);
//     return handleSuccess({
//       message: "تم إغلاق الشكوى بنجاح",
//       data: updatedComplaint,
//     });
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── حذف الشكوى ───
// export async function deleteComplaintAction(input: { id: string }) {
//   try {
//     const userId = await getCurrentUserId();
//     await deleteComplaint(userId, input.id);

//     await createAuditLog(AUDIT_LOG_ACTIONS.COMPLAINT.DELETE, "complaint", input.id, {
//       deletedAt: new Date().toISOString(),
//     });

//     revalidatePath("/complaints");
//     return handleSuccess({ message: "تم حذف الشكوى بنجاح" });
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── الحصول على جميع الشكاوى ───
// export async function getAllComplaintsAction(search?: string, status?: string, priority?: string) {
//   try {
//     const userId = await getCurrentUserId();
//     const permissionCheck = await authorizationService.checkPermission(
//       { userId },
//       AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
//     );

//     if (!permissionCheck.allowed) {
//       throw Errors.forbidden("عرض الشكاوى");
//     }

//     const complaints = await getAllComplaints(search, status, priority);
//     return handleSuccess(complaints);
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── الحصول على إحصائيات الشكاوى ───
// export async function getComplaintStatsAction() {
//   try {
//     const userId = await getCurrentUserId();
//     const permissionCheck = await authorizationService.checkPermission(
//       { userId },
//       AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
//     );

//     if (!permissionCheck.allowed) {
//       throw Errors.forbidden("عرض إحصائيات الشكاوى");
//     }

//     const stats = await getComplaintStats();
//     return handleSuccess(stats);
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── الحصول على تفاصيل الشكوى ───
// export async function getComplaintProfileDataAction(input: { complaintId: string }) {
//   try {
//     const userId = await getCurrentUserId();
//     const permissionCheck = await authorizationService.checkPermission(
//       { userId },
//       AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
//     );

//     if (!permissionCheck.allowed) {
//       throw Errors.forbidden("عرض الشكوى");
//     }

//     const complaintData = await getComplaintProfileData(input.complaintId);
//     if (!complaintData) {
//       throw Errors.notFound("الشكوى");
//     }
//     return handleSuccess(complaintData);
//   } catch (error) {
//     return handleFailure(error);
//   }
// }

// // ─── الحصول على شكوى واحدة ───
// export async function getComplaintByIdAction(input: { complaintId: string }) {
//   try {
//     const userId = await getCurrentUserId();
//     const permissionCheck = await authorizationService.checkPermission(
//       { userId },
//       AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
//     );

//     if (!permissionCheck.allowed) {
//       throw Errors.forbidden("عرض الشكوى");
//     }

//     const complaint = await getComplaintById(input.complaintId);
//     if (!complaint) {
//       throw Errors.notFound("الشكوى");
//     }
//     return handleSuccess(complaint);
//   } catch (error) {
//     return handleFailure(error);
//   }
// }
