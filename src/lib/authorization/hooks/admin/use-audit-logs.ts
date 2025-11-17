// src/lib/authorization/hooks/admin/use-audit-logs.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  type AuditLogFilters,
  getAllAuditLogsForClient,
  getAuditLogStats,
  getAuditLogsForAdmin,
} from "@/lib/authorization/actions/admin/audit-logs-actions";
import type {
  AuditLogStats,
  AuditLogsResult,
  ClientFilterParams,
  UseAuditLogsReturn,
  UseClientSideAuditLogsReturn,
} from "@/lib/authorization/types/audit-log";
import type { AuditLog } from "@/lib/database/schema";

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const auditLogKeys = {
  all: ["auditLogs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
  list: (filters: AuditLogFilters) => [...auditLogKeys.lists(), filters] as const,
  allLogs: () => [...auditLogKeys.all, "all"] as const,
  stats: () => [...auditLogKeys.all, "stats"] as const,
} as const;

// ─── Client-side Filtering Logic ────────────────────────────────────────────
function applyClientFilters({ logs, filters }: ClientFilterParams): {
  filteredLogs: AuditLog[];
  total: number;
} {
  if (!logs?.length) return { filteredLogs: [], total: 0 };

  let filtered = [...logs];

  // البحث النصي
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.entityId?.toLowerCase().includes(searchTerm) ||
        log.description?.toLowerCase().includes(searchTerm) ||
        log.action?.toLowerCase().includes(searchTerm) ||
        log.entity?.toLowerCase().includes(searchTerm),
    );
  }

  // فلترة حسب الكيان
  if (filters.entity) {
    filtered = filtered.filter((log) => log.entity === filters.entity);
  }

  // فلترة حسب النشاط
  if (filters.action) {
    filtered = filtered.filter((log) => log.action === filters.action);
  }

  // فلترة حسب المستخدم
  if (filters.userId) {
    filtered = filtered.filter((log) => log.userId === filters.userId);
  }

  // فلترة حسب الخطورة
  if (filters.severity) {
    filtered = filtered.filter((log) => log.severity === filters.severity);
  }

  // فلترة حسب الحالة
  if (filters.status) {
    filtered = filtered.filter((log) => log.status === filters.status);
  }

  // فلترة حسب التاريخ
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    filtered = filtered.filter((log) => {
      const logDate = new Date(log.createdAt);
      return logDate >= startDate;
    });
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999); // نهاية اليوم
    filtered = filtered.filter((log) => {
      const logDate = new Date(log.createdAt);
      return logDate <= endDate;
    });
  }

  return {
    filteredLogs: filtered,
    total: filtered.length,
  };
}

// ─── Helper function لتحويل filterMode ─────────────────────────────────────
function normalizeFilterMode(filterMode: "client" | "server" | "hybrid" | undefined): "client" | "server" {
  if (filterMode === "hybrid") {
    return "server"; // hybrid يعامل كـ server في النتيجة النهائية
  }
  return filterMode || "server";
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
export function useAuditLogs(filters: AuditLogFilters): UseAuditLogsReturn {
  const queryResult = useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: async (): Promise<AuditLogsResult> => {
      const result = await getAuditLogsForAdmin(filters);

      if (!result.success) {
        throw new Error(result.error?.message || "فشل تحميل السجلات");
      }

      return result.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // معالجة نتائج Query المختلفة
  const { data, isLoading, error } = queryResult;

  return {
    logs: data?.logs ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error: error as Error | null,
    filterMode: normalizeFilterMode(data?.filterMode),
  };
}

export function useClientSideAuditLogs(filters: AuditLogFilters): UseClientSideAuditLogsReturn {
  const queryResult = useQuery({
    queryKey: auditLogKeys.allLogs(),
    queryFn: async (): Promise<AuditLog[]> => {
      const result = await getAllAuditLogsForClient();
      if (!result.success) {
        throw new Error(result.error?.message || "فشل تحميل السجلات");
      }
      return result.data.data as AuditLog[]; // Type assertion هنا
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: allLogs, isLoading, error } = queryResult;

  // تطبيق الفلترة في العميل
  const { filteredLogs, total } = useMemo(() => {
    if (!allLogs) return { filteredLogs: [], total: 0 };

    return applyClientFilters({
      logs: allLogs,
      filters: {
        search: filters.search,
        entity: filters.entity,
        action: filters.action,
        userId: filters.userId,
        severity: filters.severity,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    });
  }, [allLogs, filters]);

  // التقسيم للصفحات
  const paginatedLogs = useMemo(() => {
    const startIndex = ((filters.page ?? 1) - 1) * (filters.perPage ?? 50);
    return filteredLogs.slice(startIndex, startIndex + (filters.perPage ?? 50));
  }, [filteredLogs, filters.page, filters.perPage]);

  const totalPages = Math.ceil(total / (filters.perPage ?? 50));

  return {
    logs: paginatedLogs,
    allLogs,
    filteredLogs,
    total,
    totalPages,
    isLoading,
    error: error as Error | null,
    filterMode: "client",
  };
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: auditLogKeys.stats(),
    queryFn: async (): Promise<AuditLogStats> => {
      const result = await getAuditLogStats();

      if (!result.success) {
        throw new Error(result.error?.message || "فشل تحميل الإحصائيات");
      }

      return result.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Utility Hooks ──────────────────────────────────────────────────────────
export function useRecentAuditLogs(limit: number = 10): UseAuditLogsReturn {
  return useAuditLogs({
    page: 1,
    perPage: limit,
    filterMode: "server",
  });
}

export function useFailedLoginLogs(limit: number = 20): UseAuditLogsReturn {
  return useAuditLogs({
    action: "auth.login.failed",
    page: 1,
    perPage: limit,
    filterMode: "server",
  });
}

export function useHighSeverityLogs(limit: number = 20): UseAuditLogsReturn {
  return useAuditLogs({
    severity: "high",
    page: 1,
    perPage: limit,
    filterMode: "server",
  });
}

// ─── Smart Hook بدون استدعاء شرطي للـ Hooks ─────────────────────────────────
export function useSmartAuditLogs(filters: AuditLogFilters): UseAuditLogsReturn {
  // نحدد إذا كنا نفضل الفلترة في العميل
  const shouldUseClientFiltering = useMemo(
    () =>
      !filters.entity &&
      !filters.action &&
      !filters.userId &&
      !filters.severity &&
      !filters.status &&
      !filters.startDate &&
      !filters.endDate &&
      (!filters.search || filters.search.length <= 3),
    [filters],
  );

  // نستخدم كلا الـ hooks
  const serverResult = useAuditLogs({ ...filters, filterMode: "server" });
  const clientResult = useClientSideAuditLogs(filters);

  // نختار النتيجة بناءً على الشرط
  return shouldUseClientFiltering
    ? {
        logs: clientResult.logs,
        total: clientResult.total,
        totalPages: clientResult.totalPages,
        isLoading: clientResult.isLoading,
        error: clientResult.error,
        filterMode: "client",
      }
    : {
        logs: serverResult.logs,
        total: serverResult.total,
        totalPages: serverResult.totalPages,
        isLoading: serverResult.isLoading,
        error: serverResult.error,
        filterMode: "server",
      };
}

// "use client";

// import { queryOptions, useQuery } from "@tanstack/react-query";
// import { type AuditLogFilters, getAuditLogsForAdmin } from "@/app/admin/audit-logs/actions";

// const auditLogsListOptions = (filters: AuditLogFilters) =>
//   queryOptions({
//     queryKey: ["auditLogs", filters],
//     queryFn: async () => {
//       const result = await getAuditLogsForAdmin(filters);
//       if (!result.success) {
//         throw new Error(result.error?.message || "فشل تحميل السجلات");
//       }
//       return result.data; // ← TypeScript سيعرف أن هذا AuditLogsResult
//     },
//     staleTime: 30 * 1000,
//   });

// export function useAuditLogs(filters: AuditLogFilters) {
//   // ✅ لا تمرر أنواع صريحة — دع TypeScript يستنتجها
//   return useQuery(auditLogsListOptions(filters));
// }
