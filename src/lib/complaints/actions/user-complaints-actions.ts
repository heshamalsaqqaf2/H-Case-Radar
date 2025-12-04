"use server";

import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import { UserComplaintService } from "@/lib/complaints/services/user-complaints-service";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import { Errors } from "@/lib/errors/error-factory";

export async function getUserAssignedComplaintsAction(pageSize = 10, cursor?: string) {
  try {
    const userId = await getCurrentUserId();
    // Check for basic VIEW permission as a baseline
    const permissionCheck = await authorizationService.checkPermission(
      { userId },
      AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
    );
    if (!permissionCheck.allowed) throw Errors.forbidden("عرض الشكاوى");

    const result = await UserComplaintService.getUserAssignedComplaints(userId, pageSize, cursor);
    return handleSuccess(result);
  } catch (error) {
    return handleFailure(error);
  }
}
