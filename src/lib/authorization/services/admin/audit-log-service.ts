// src/lib/authorization/services/admin/audit-log-service.ts

import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { getCurrentUserId } from "@/lib/authentication/session";
import type { AuditLogFilters } from "@/lib/authorization/types/audit-log";
import { auditLog } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";

// ─── Helper: Safe JSON Serialization ────────────────────────────────────────
const safeStringify = (obj: unknown): string => {
  try {
    return JSON.stringify(obj, (_key, value) => (typeof value === "bigint" ? value.toString() : value));
  } catch {
    return JSON.stringify({ error: "Failed to serialize audit details" });
  }
};

// ─── Helper: Extract Client IP ───────────────────────────────────────────────
function getClientIP(headersList: Headers): string | null {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;
}

// ─── Helper: Extract Client Info Safely ──────────────────────────────────────
async function getClientInfo() {
  try {
    const headersList = await headers();
    const ipAddress = getClientIP(headersList);
    const userAgent = headersList.get("user-agent") || null;
    return { ipAddress, userAgent };
  } catch {
    // Silent failure – do not log or throw
    return { ipAddress: null, userAgent: null };
  }
}

// ─── Helper: Sanitize Sensitive Data ─────────────────────────────────────────
function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ["password", "token", "secret", "key", "refreshToken", "accessToken"];
  const sanitized = { ...details };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "***REDACTED***";
    }
  }

  return sanitized;
}

// ─── Helper: Validate Audit Parameters ───────────────────────────────────────
function validateAuditParams(action: string, entity: string, entityId: string): boolean {
  return !!(action?.trim() && entity?.trim() && entityId?.trim());
}

// ─── Core Service Functions ─────────────────────────────────────────────────
export async function createAuditLog(
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    if (!validateAuditParams(action, entity, entityId)) {
      return;
    }

    let userId = await getCurrentUserId();
    if (!userId) {
      userId = "anonymous";
    }

    const { ipAddress, userAgent } = await getClientInfo();
    const sanitizedDetails = sanitizeDetails(details);
    const detailsJson = safeStringify(sanitizedDetails);

    await db.insert(auditLog).values({
      userId,
      action: action.trim(),
      entity: entity.trim(),
      entityId: entityId.trim(),
      details: detailsJson,
      ipAddress,
      userAgent,
    });
  } catch {
    // Silent catch: audit logging must never fail the main operation
  }
}

export async function logFailedLogin(email: string, ipAddress: string | null = null): Promise<void> {
  try {
    const { ipAddress: headersIP, userAgent } = await getClientInfo();
    const finalIP = ipAddress || headersIP;

    const detailsJson = safeStringify({
      email: email.trim().toLowerCase(),
      timestamp: new Date().toISOString(),
    });

    await db.insert(auditLog).values({
      userId: "anonymous",
      action: "auth.login.failed",
      entity: "auth",
      entityId: email.trim().toLowerCase(),
      details: detailsJson,
      ipAddress: finalIP,
      userAgent,
    });
  } catch {
    // Silent catch
  }
}

export async function logSuccessfulLogin(userId: string): Promise<void> {
  await createAuditLog("auth.login.success", "auth", userId, {
    timestamp: new Date().toISOString(),
  });
}

export async function logUnauthorizedAccess(
  resource: string,
  resourceId: string,
  attemptedAction: string,
): Promise<void> {
  await createAuditLog("security.unauthorized.access", "security", resourceId, {
    resource,
    attemptedAction,
    timestamp: new Date().toISOString(),
  });
}

// ─── Data Retrieval Services ────────────────────────────────────────────────
export async function getServerFilteredAuditLogs(filters: {
  entity?: string;
  action?: string;
  userId?: string;
  severity?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page: number;
  perPage: number;
}) {
  const conditions = [];

  // Server-side conditions
  if (filters.entity) {
    conditions.push(eq(auditLog.entity, filters.entity));
  }

  if (filters.action) {
    conditions.push(eq(auditLog.action, filters.action));
  }

  if (filters.userId) {
    conditions.push(eq(auditLog.userId, filters.userId));
  }

  if (filters.severity) {
    conditions.push(eq(auditLog.severity, filters.severity));
  }

  if (filters.status) {
    conditions.push(eq(auditLog.status, filters.status));
  }

  if (filters.startDate) {
    conditions.push(gte(auditLog.createdAt, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(auditLog.createdAt, filters.endDate));
  }

  // Hybrid search (server-side search when needed)
  if (filters.search && filters.search.length > 2) {
    conditions.push(
      or(
        like(auditLog.entityId, `%${filters.search}%`),
        like(auditLog.description, `%${filters.search}%`),
        like(auditLog.action, `%${filters.search}%`),
      ),
    );
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(auditLog).where(whereCondition);

  const total = totalResult[0]?.count || 0;

  // Get paginated logs
  const logs = await db
    .select({
      id: auditLog.id,
      userId: auditLog.userId,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      description: auditLog.description,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      country: auditLog.country,
      city: auditLog.city,
      details: auditLog.details,
      status: auditLog.status,
      severity: auditLog.severity,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(whereCondition)
    .orderBy(desc(auditLog.createdAt))
    .limit(filters.perPage)
    .offset((filters.page - 1) * filters.perPage);

  return { logs, total };
}

export async function getAllAuditLogsForClientFiltering(limit: number = 5000) {
  const logs = await db
    .select({
      id: auditLog.id,
      userId: auditLog.userId,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      description: auditLog.description,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      country: auditLog.country,
      city: auditLog.city,
      details: auditLog.details,
      status: auditLog.status,
      severity: auditLog.severity,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return logs;
}

export async function getAuditLogStatistics() {
  // إجمالي السجلات
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(auditLog);

  // السجلات اليوم
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLog)
    .where(gte(auditLog.createdAt, today));

  // السجلات حسب النشاط
  const activityResult = await db
    .select({
      action: auditLog.action,
      count: sql<number>`count(*)`,
    })
    .from(auditLog)
    .groupBy(auditLog.action)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(10);

  // الكيانات الأكثر نشاطاً
  const entityResult = await db
    .select({
      entity: auditLog.entity,
      count: sql<number>`count(*)`,
    })
    .from(auditLog)
    .groupBy(auditLog.entity)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(10);

  return {
    total: totalResult[0]?.count || 0,
    todayCount: todayResult[0]?.count || 0,
    topActivities: activityResult,
    entities: entityResult,
  };
}

// // src/lib/authorization/services/admin/audit-log-service.ts
// /** biome-ignore-all lint/complexity/noStaticOnlyClass: <> */
// import { headers } from "next/headers";
// import { auth } from "@/lib/authentication/auth-server";
// import { getCurrentUserId } from "@/lib/authentication/session";
// import type { AuditAction, AuditLogContext, CreateAuditLogParams } from "@/lib/authorization/types/audit-log";
// import { auditLog } from "@/lib/database/schema";
// import { database as db } from "@/lib/database/server";

// // ─── Constants ──────────────────────────────────────────────────────────────
// const SENSITIVE_FIELDS = [
//   "password",
//   "token",
//   "secret",
//   "key",
//   "refreshToken",
//   "accessToken",
//   "authorization",
//   "cookie",
// ];

// const AUDIT_LOG_RETENTION_DAYS = 365;

// // ─── Helpers ────────────────────────────────────────────────────────────────
// const safeStringify = (obj: unknown): string => {
//   try {
//     return JSON.stringify(obj, (_key, value) => {
//       if (typeof value === "bigint") return value.toString();
//       if (value instanceof Date) return value.toISOString();
//       if (value === undefined) return null;
//       return value;
//     });
//   } catch {
//     return JSON.stringify({ error: "Failed to serialize audit details" });
//   }
// };

// const getClientIP = (headersList: Headers): string | null => {
//   const forwardedFor = headersList.get("x-forwarded-for");
//   if (forwardedFor) {
//     return forwardedFor.split(",")[0].trim();
//   }

//   return headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;
// };

// const sanitizeDetails = (details: Record<string, unknown>): Record<string, unknown> => {
//   const sanitized = { ...details };

//   const sanitizeObject = (obj: Record<string, unknown>) => {
//     for (const [key, value] of Object.entries(obj)) {
//       if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
//         obj[key] = "***REDACTED***";
//       } else if (value && typeof value === "object" && !Array.isArray(value)) {
//         sanitizeObject(value as Record<string, unknown>);
//       }
//     }
//   };

//   sanitizeObject(sanitized);
//   return sanitized;
// };

// const validateAuditParams = (params: CreateAuditLogParams): boolean => {
//   return !!(params.action?.trim() && params.entity?.trim() && params.entityId?.trim());
// };

// const getDefaultContext = async (): Promise<AuditLogContext> => {
//   try {
//     const headersList = await headers();
//     const ipAddress = getClientIP(headersList);
//     const userAgent = headersList.get("user-agent") || null;

//     const session = await auth.api.getSession({ headers: await headers() });
//     const userId = await getCurrentUserId();

//     return {
//       userId: userId || "anonymous",
//       sessionId: session?.session.id,
//       ipAddress,
//       userAgent,
//     };
//   } catch {
//     return {
//       userId: "anonymous",
//       ipAddress: null,
//       userAgent: null,
//     };
//   }
// };

// // ─── Main Service ───────────────────────────────────────────────────────────
// export class AuditLogService {
//   /**
//    * إنشاء سجل تدقيق شامل
//    */
//   static async create(params: CreateAuditLogParams): Promise<void> {
//     try {
//       if (!validateAuditParams(params)) {
//         return;
//       }

//       const defaultContext = await getDefaultContext();
//       const context = { ...defaultContext, ...params.context };

//       const sanitizedDetails = params.details ? sanitizeDetails(params.details) : {};
//       const detailsJson = safeStringify(sanitizedDetails);

//       // Calculate expiration date for data retention
//       const expiresAt = new Date();
//       expiresAt.setDate(expiresAt.getDate() + AUDIT_LOG_RETENTION_DAYS);

//       await db.insert(auditLog).values({
//         userId: context.userId,
//         sessionId: context.sessionId,
//         action: params.action.trim(),
//         entity: params.entity.trim(),
//         entityId: params.entityId.trim(),
//         resourceType: context.resourceType,
//         resourceId: context.resourceId,
//         description: context.description,
//         ipAddress: context.ipAddress,
//         userAgent: context.userAgent,
//         details: detailsJson,
//         status: context.status || "success",
//         severity: context.severity || "info",
//         expiresAt,
//       });
//     } catch {
//       // Silent failure - audit should not break main operations
//     }
//   }

//   /**
//    * سجل محاولة تسجيل دخول فاشلة
//    */
//   static async logFailedLogin(email: string, reason: string = "invalid_credentials"): Promise<void> {
//     const context = await getDefaultContext();

//     await AuditLogService.create({
//       action: "auth.login.failed",
//       entity: "auth",
//       entityId: email.trim().toLowerCase(),
//       details: {
//         email: email.trim().toLowerCase(),
//         reason,
//         timestamp: new Date().toISOString(),
//       },
//       context: {
//         ...context,
//         status: "failure",
//         severity: "medium",
//       },
//     });
//   }

//   /**
//    * سجل تسجيل دخول ناجح
//    */
//   static async logSuccessfulLogin(userId: string): Promise<void> {
//     await AuditLogService.create({
//       action: "auth.login.success",
//       entity: "auth",
//       entityId: userId,
//       context: {
//         userId,
//         status: "success",
//         severity: "info",
//       },
//     });
//   }

//   /**
//    * سجل عملية حساسة
//    */
//   static async logSensitiveOperation(
//     action: AuditAction | string,
//     entity: string,
//     entityId: string,
//     details?: Record<string, unknown>,
//   ): Promise<void> {
//     const context = await getDefaultContext();

//     await AuditLogService.create({
//       action,
//       entity,
//       entityId,
//       details,
//       context: {
//         ...context,
//         severity: "high",
//       },
//     });
//   }

//   /**
//    * سجل وصول غير مصرح به
//    */
//   static async logUnauthorizedAccess(
//     resource: string,
//     resourceId: string,
//     attemptedAction: string,
//   ): Promise<void> {
//     const context = await getDefaultContext();

//     await AuditLogService.create({
//       action: "security.unauthorized.access",
//       entity: "security",
//       entityId: resourceId,
//       details: {
//         resource,
//         resourceId,
//         attemptedAction,
//         timestamp: new Date().toISOString(),
//       },
//       context: {
//         ...context,
//         status: "failure",
//         severity: "high",
//       },
//     });
//   }

//   /**
//    * سجل خطأ في النظام
//    */
//   static async logSystemError(
//     error: Error,
//     component: string,
//     additionalDetails?: Record<string, unknown>,
//   ): Promise<void> {
//     const context = await getDefaultContext();

//     await AuditLogService.create({
//       action: "system.error",
//       entity: "system",
//       entityId: component,
//       details: {
//         error: error.message,
//         stack: error.stack,
//         component,
//         ...additionalDetails,
//       },
//       context: {
//         ...context,
//         status: "failure",
//         severity: "critical",
//       },
//     });
//   }
// }

// // ─── Convenience Exports ────────────────────────────────────────────────────
// export const createAuditLog = AuditLogService.create.bind(AuditLogService);
// export const logFailedLogin = AuditLogService.logFailedLogin.bind(AuditLogService);
// export const logSuccessfulLogin = AuditLogService.logSuccessfulLogin.bind(AuditLogService);
// export const logSensitiveOperation = AuditLogService.logSensitiveOperation.bind(AuditLogService);
// export const logUnauthorizedAccess = AuditLogService.logUnauthorizedAccess.bind(AuditLogService);
// export const logSystemError = AuditLogService.logSystemError.bind(AuditLogService);

// import { headers } from "next/headers";
// import { getCurrentUserId } from "@/lib/authentication/session";
// import { auditLog } from "@/lib/database/schema";
// import { database as db } from "@/lib/database/server";

// // ─── Helper: Safe JSON Serialization ────────────────────────────────────────
// const safeStringify = (obj: unknown): string => {
//   try {
//     return JSON.stringify(obj, (_key, value) => (typeof value === "bigint" ? value.toString() : value));
//   } catch {
//     return JSON.stringify({ error: "Failed to serialize audit details" });
//   }
// };

// // ─── Helper: Extract Client IP ───────────────────────────────────────────────
// function getClientIP(headersList: Headers): string | null {
//   const forwardedFor = headersList.get("x-forwarded-for");
//   if (forwardedFor) {
//     return forwardedFor.split(",")[0].trim();
//   }
//   return headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;
// }

// // ─── Helper: Extract Client Info Safely ──────────────────────────────────────
// async function getClientInfo() {
//   try {
//     const headersList = await headers();
//     const ipAddress = getClientIP(headersList);
//     const userAgent = headersList.get("user-agent") || null;
//     return { ipAddress, userAgent };
//   } catch {
//     // Silent failure – do not log or throw
//     return { ipAddress: null, userAgent: null };
//   }
// }

// // ─── Helper: Sanitize Sensitive Data ─────────────────────────────────────────
// function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
//   const sensitiveFields = ["password", "token", "secret", "key", "refreshToken", "accessToken"];
//   const sanitized = { ...details };

//   for (const field of sensitiveFields) {
//     if (field in sanitized) {
//       sanitized[field] = "***REDACTED***";
//     }
//   }

//   return sanitized;
// }

// // ─── Helper: Validate Audit Parameters ───────────────────────────────────────
// function validateAuditParams(action: string, entity: string, entityId: string): boolean {
//   return !!(action?.trim() && entity?.trim() && entityId?.trim());
// }

// // ─── Main: Create Audit Log ──────────────────────────────────────────────────
// export async function createAuditLog(
//   action: string,
//   entity: string,
//   entityId: string,
//   details: Record<string, unknown> = {},
// ): Promise<void> {
//   try {
//     if (!validateAuditParams(action, entity, entityId)) {
//       // Silent early return on invalid input – do not log
//       return;
//     }

//     let userId = await getCurrentUserId();
//     if (!userId) {
//       userId = "anonymous";
//     }

//     const { ipAddress, userAgent } = await getClientInfo();
//     const sanitizedDetails = sanitizeDetails(details);
//     const detailsJson = safeStringify(sanitizedDetails);

//     await db.insert(auditLog).values({
//       userId,
//       action: action.trim(),
//       entity: entity.trim(),
//       entityId: entityId.trim(),
//       details: detailsJson,
//       ipAddress,
//       userAgent,
//     });
//   } catch {
//     // Silent catch: audit logging must never fail the main operation
//     // Optional: send to external monitoring (e.g., Sentry) if configured
//   }
// }

// // ─── Special Case: Failed Login Attempt ──────────────────────────────────────
// export async function logFailedLogin(email: string, ipAddress: string | null = null): Promise<void> {
//   try {
//     const { ipAddress: headersIP, userAgent } = await getClientInfo();
//     const finalIP = ipAddress || headersIP;

//     const detailsJson = safeStringify({
//       email: email.trim().toLowerCase(),
//       timestamp: new Date().toISOString(),
//     });

//     await db.insert(auditLog).values({
//       userId: "anonymous",
//       action: "auth.login.failed",
//       entity: "auth",
//       entityId: email.trim().toLowerCase(),
//       details: detailsJson,
//       ipAddress: finalIP,
//       userAgent,
//     });
//   } catch {
//     // Silent catch – same principle
//   }
// }
