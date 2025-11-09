import type { AuditLog } from "@/lib/database/schema";

export type GetAuditLogsOptions = {
  entity?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  perPage?: number;
};

export type AuditLogsResult = {
  logs: AuditLog[];
  total: number;
  page: number;
  perPage: number;
};
