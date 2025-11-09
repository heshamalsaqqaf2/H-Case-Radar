"use server";

import { z } from "zod";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { g } from "@/lib/authorization/services/admin/audit-log-query-service";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";

const AuditLogFiltersSchema = z.object({
  entity: z.string().optional(),
  action: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;

/**
 * جلب السجلات الأمنية مع دعم التصفية والصفحات
 * يتطلب صلاحية "audit.view"
 */
export async function getAuditLogsForAdmin(input: unknown) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return handleFailure("غير مصرح به");
    }

    const permissionCheck = await authorizationService.checkPermission(
      { userId, environment: {} },
      AUDIT_LOG_ACTIONS.AUDIT_LOG.VIEW,
    );
    if (!permissionCheck.allowed) {
      return handleFailure("ليس لديك صلاحية عرض السجلات الأمنية");
    }

    const filters = AuditLogFiltersSchema.parse(input);
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

    const auditLogsResult = await getAuditLogs({
      entity: filters.entity,
      action: filters.action,
      startDate,
      endDate,
      page: filters.page,
      perPage: filters.perPage,
    });

    return handleSuccess({
      logs: auditLogsResult.logs,
      total: auditLogsResult.total,
      page: filters.page,
      perPage: filters.perPage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleFailure("بيانات التصفية غير صالحة");
    }
    console.error("Error in getAuditLogsForAdmin:", error);
    return handleFailure("فشل تحميل السجلات الأمنية");
  }
}
