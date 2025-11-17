// src/lib/authorization/types/audit-log.ts
import type { AuditLog } from "@/lib/database/schema";

// ─── Filter Types ────────────────────────────────────────────────────────────
export interface AuditLogFilters {
  // Client-side filters
  search?: string;
  page: number;
  perPage: number;
  filterMode: "client" | "server" | "hybrid";

  // Server-side filters
  entity?: string;
  action?: string;
  userId?: string;
  severity?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetAuditLogsOptions extends AuditLogFilters {}

// ─── Result Types ────────────────────────────────────────────────────────────
export interface AuditLogsResult {
  logs: AuditLog[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  filterMode: "client" | "server" | "hybrid";
  hasMore?: boolean;
}

export interface AuditLogStats {
  total: number;
  todayCount: number;
  bySeverity: {
    info: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byStatus: {
    success: number;
    failure: number;
    warning: number;
  };
  byEntity: Record<string, number>;
  topActivities: Array<{
    action: string;
    count: number;
  }>;
  entities: Array<{
    entity: string;
    count: number;
  }>;
}

// ─── Client-side Filtering Types ────────────────────────────────────────────
export interface ClientFilterParams {
  logs: AuditLog[];
  filters: {
    search?: string;
    entity?: string;
    action?: string;
    userId?: string;
    severity?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

// ─── Hook Return Types ──────────────────────────────────────────────────────
export interface UseAuditLogsReturn {
  logs: AuditLog[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  filterMode: "client" | "server";
}

export interface UseClientSideAuditLogsReturn extends UseAuditLogsReturn {
  allLogs?: AuditLog[];
  filteredLogs: AuditLog[];
}

// ─── Service Types ──────────────────────────────────────────────────────────
export interface AuditLogContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  resourceType?: string;
  resourceId?: string;
  description?: string;
  status?: "success" | "failure" | "warning";
  severity?: "info" | "low" | "medium" | "high" | "critical";
}

export interface CreateAuditLogParams {
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  context?: Partial<AuditLogContext>;
}

// ─── Export Types ────────────────────────────────────────────────────────────
export interface ExportAuditLogsOptions {
  format: "json" | "csv";
  filters: Omit<AuditLogFilters, "page" | "perPage">;
}

export interface ExportAuditLogsResult {
  message: string;
  logs: AuditLog[];
  total: number;
  exportedAt: string;
}

// // src/lib/authorization/types/audit-log.ts
// import type { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
// import type { AuditLog } from "@/lib/database/schema";

// // ─── Core Types ──────────────────────────────────────────────────────────────
// export type AuditAction =
//   (typeof AUDIT_LOG_ACTIONS)[keyof typeof AUDIT_LOG_ACTIONS][keyof (typeof AUDIT_LOG_ACTIONS)[keyof typeof AUDIT_LOG_ACTIONS]];

// export type AuditLogSeverity = "info" | "low" | "medium" | "high" | "critical";
// export type AuditLogStatus = "success" | "failure" | "warning";

// // ─── Filter Types ────────────────────────────────────────────────────────────
// export interface AuditLogFilters {
//   entity?: string;
//   action?: string;
//   userId?: string;
//   status?: AuditLogStatus;
//   severity?: AuditLogSeverity;
//   startDate?: Date;
//   endDate?: Date;
//   search?: string;
//   page?: number;
//   perPage?: number;
// }

// export interface GetAuditLogsOptions extends AuditLogFilters {}

// // ─── Result Types ────────────────────────────────────────────────────────────
// export interface AuditLogsResult {
//   logs: AuditLog[];
//   total: number;
//   page: number;
//   perPage: number;
//   totalPages: number;
// }

// export interface AuditLogStats {
//   total: number;
//   bySeverity: Record<AuditLogSeverity, number>;
//   byStatus: Record<AuditLogStatus, number>;
//   byEntity: Record<string, number>;
//   todayCount: number;
// }

// // ─── Service Types ───────────────────────────────────────────────────────────
// export interface AuditLogContext {
//   userId?: string;
//   sessionId?: string;
//   ipAddress?: string | null;
//   userAgent?: string | null;
//   resourceType?: string;
//   resourceId?: string;
//   description?: string;
//   status?: AuditLogStatus;
//   severity?: AuditLogSeverity;
// }

// export interface CreateAuditLogParams {
//   action: AuditAction | string;
//   entity: string;
//   entityId: string;
//   details?: Record<string, unknown>;
//   context?: Partial<AuditLogContext>;
// }

// // ─── Export Types ────────────────────────────────────────────────────────────
// export interface ExportAuditLogsOptions {
//   format: "json" | "csv";
//   filters: Omit<AuditLogFilters, "page" | "perPage">;
// }

// // ─── Hook Types ──────────────────────────────────────────────────────────────
// export interface UseAuditLogsOptions extends AuditLogFilters {
//   enabled?: boolean;
// }

// export interface UseAuditLogStatsOptions {
//   startDate?: Date;
//   endDate?: Date;
// }

// import type { AuditLog } from "@/lib/database/schema";

// export type GetAuditLogsOptions = {
//   entity?: string;
//   action?: string;
//   startDate?: Date;
//   endDate?: Date;
//   page?: number;
//   perPage?: number;
// };

// export type AuditLogsResult = {
//   logs: AuditLog[];
//   total: number;
//   page: number;
//   perPage: number;
// };
