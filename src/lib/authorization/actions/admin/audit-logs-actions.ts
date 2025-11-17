// src/app/admin/audit-logs/actions.ts
"use server";

import { z } from "zod";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import {
  createAuditLog,
  getAllAuditLogsForClientFiltering,
  getAuditLogStatistics,
  getServerFilteredAuditLogs,
  logFailedLogin,
  logSuccessfulLogin,
  logUnauthorizedAccess,
} from "@/lib/authorization/services/admin/audit-log-service";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import type { AuditLogsResult } from "@/lib/authorization/types/audit-log";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";

// ─── Validation Schema ──────────────────────────────────────────────────────
const AuditLogFiltersSchema = z.object({
  // Client-side filters
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(200).default(50),

  // Server-side filters
  entity: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),

  // Filter mode
  filterMode: z.enum(["client", "server", "hybrid"]).default("hybrid"),
});

export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;

// ─── Server Actions ─────────────────────────────────────────────────────────
/**
 * جلب السجلات الأمنية مع دعم أنماط الفلترة المختلفة
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
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

    let logs: any[] = [];
    let total = 0;
    let filterMode: "client" | "server" | "hybrid" = filters.filterMode;

    // تحديد استراتيجية الفلترة تلقائياً
    const useServerFiltering =
      filters.filterMode === "server" ||
      filters.entity ||
      filters.action ||
      filters.userId ||
      filters.severity ||
      filters.status ||
      filters.startDate ||
      filters.endDate ||
      (filters.search && filters.search.length > 2);

    if (useServerFiltering) {
      // فلترة من الخادم للبيانات الكبيرة أو الفلترة المعقدة
      const result = await getServerFilteredAuditLogs({
        ...filters,
        startDate,
        endDate,
        page: filters.page,
        perPage: filters.perPage,
      });
      logs = result.logs;
      total = result.total;
      filterMode = "server";
    } else {
      // فلترة من العميل للبيانات المتوسطة والبحث البسيط
      const allLogs = await getAllAuditLogsForClientFiltering();
      logs = allLogs;
      total = allLogs.length;
      filterMode = "client";
    }

    const totalPages = Math.ceil(total / filters.perPage);

    const result: AuditLogsResult = {
      logs,
      total,
      page: filters.page,
      perPage: filters.perPage,
      totalPages,
      filterMode,
      hasMore: filters.page < totalPages,
    };

    return handleSuccess(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleFailure("بيانات التصفية غير صالحة");
    }
    return handleFailure("فشل تحميل السجلات الأمنية");
  }
}

/**
 * جلب جميع السجلات للفلترة في العميل (للاستخدام المباشر)
 */
export async function getAllAuditLogsForClient() {
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

    const logs = await getAllAuditLogsForClientFiltering(10000);

    return handleSuccess({
      // logs
      message: "تم تحميل السجلات الأمنية بنجاح",
      data: logs,
    });
  } catch (error) {
    return handleFailure(error);
  }
}

/**
 * جلب إحصائيات السجلات الأمنية
 */
export async function getAuditLogStats() {
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
      return handleFailure("ليس لديك صلاحية عرض الإحصائيات");
    }

    const stats = await getAuditLogStatistics();
    return handleSuccess(stats);
  } catch (error) {
    return handleFailure("فشل تحميل الإحصائيات");
  }
}

/**
 * إنشاء سجل تدقيق جديد
 */
export async function createAuditLogAction(
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, unknown> = {},
) {
  try {
    await createAuditLog(action, entity, entityId, details);
    return handleSuccess({ message: "تم إنشاء سجل التدقيق بنجاح" });
  } catch (error) {
    return handleFailure("فشل إنشاء سجل التدقيق");
  }
}

/**
 * تسجيل محاولة تسجيل دخول فاشلة
 */
export async function logFailedLoginAction(email: string, ipAddress: string | null = null) {
  try {
    await logFailedLogin(email, ipAddress);
    return handleSuccess({ message: "تم تسجيل محاولة الدخول الفاشلة" });
  } catch (error) {
    return handleFailure("فشل تسجيل محاولة الدخول");
  }
}

/**
 * تسجيل تسجيل دخول ناجح
 */
export async function logSuccessfulLoginAction(userId: string) {
  try {
    await logSuccessfulLogin(userId);
    return handleSuccess({ message: "تم تسجيل الدخول الناجح" });
  } catch (error) {
    return handleFailure("فشل تسجيل الدخول الناجح");
  }
}

/**
 * تسجيل محاولة وصول غير مصرح بها
 */
export async function logUnauthorizedAccessAction(
  resource: string,
  resourceId: string,
  attemptedAction: string,
) {
  try {
    await logUnauthorizedAccess(resource, resourceId, attemptedAction);
    return handleSuccess({ message: "تم تسجيل محاولة الوصول غير المصرح" });
  } catch (error) {
    return handleFailure("فشل تسجيل محاولة الوصول");
  }
}
