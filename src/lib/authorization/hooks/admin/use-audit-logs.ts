"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  type AuditLogFilters,
  getAuditLogsForAdmin,
} from "@/app/admin/audit-logs/actions";

const auditLogsListOptions = (filters: AuditLogFilters) =>
  queryOptions({
    queryKey: ["auditLogs", filters],
    queryFn: async () => {
      const result = await getAuditLogsForAdmin(filters);
      if (!result.success) {
        throw new Error(result.error?.message || "فشل تحميل السجلات");
      }
      return result.data; // ← TypeScript سيعرف أن هذا AuditLogsResult
    },
    staleTime: 30 * 1000,
  });

export function useAuditLogs(filters: AuditLogFilters) {
  // ✅ لا تمرر أنواع صريحة — دع TypeScript يستنتجها
  return useQuery(auditLogsListOptions(filters));
}

// ─── Hooks: Mutations (مثال: تصدير إلى CSV مستقبلاً)
// export function useExportAuditLogs() {
//   return useAdminMutation<void>({
//     mutationFn: exportAuditLogsAction,
//     successMessage: "تم التصدير بنجاح",
//     errorMessage: "خطأ في التصدير",
//   });
// }
