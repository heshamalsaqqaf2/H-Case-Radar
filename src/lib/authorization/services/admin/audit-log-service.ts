import { headers } from "next/headers";
import { getCurrentUserId } from "@/lib/authentication/session";
import { auditLog } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";

// ─── Helper: Safe JSON Serialization ────────────────────────────────────────
const safeStringify = (obj: unknown): string => {
  try {
    return JSON.stringify(obj, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    );
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
  return (
    headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null
  );
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
function sanitizeDetails(
  details: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "refreshToken",
    "accessToken",
  ];
  const sanitized = { ...details };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "***REDACTED***";
    }
  }

  return sanitized;
}

// ─── Helper: Validate Audit Parameters ───────────────────────────────────────
function validateAuditParams(
  action: string,
  entity: string,
  entityId: string,
): boolean {
  return !!(action?.trim() && entity?.trim() && entityId?.trim());
}

// ─── Main: Create Audit Log ──────────────────────────────────────────────────
export async function createAuditLog(
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    if (!validateAuditParams(action, entity, entityId)) {
      // Silent early return on invalid input – do not log
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
    // Optional: send to external monitoring (e.g., Sentry) if configured
  }
}

// ─── Special Case: Failed Login Attempt ──────────────────────────────────────
export async function logFailedLogin(
  email: string,
  ipAddress: string | null = null,
): Promise<void> {
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
    // Silent catch – same principle
  }
}

// // src/lib/authorization/services/admin/audit-log-service.ts
// import { headers } from "next/headers";
// import { getCurrentUserId } from "@/lib/authentication/session";
// import { database as db } from "@/lib/database";
// import { auditLog } from "@/lib/database/schema";
// import { Errors } from "@/lib/errors/error-factory";

// // TODO: Helper Functions
// async function getClientInfo() {
//   try {
//     const headersList = await headers();
//     const ipAddress = getClientIP(headersList);
//     const userAgent = headersList.get("user-agent") || null;

//     return { ipAddress, userAgent };
//   } catch (error) {
//     const errorUserAgent = Errors.internal("فشل في استخراج معلومات العميل");
//     console.error(errorUserAgent.message, error);
//     return { ipAddress: null, userAgent: null };
//   }
// }

// function getClientIP(headersList: Headers): string | null {
//   const forwardedFor = headersList.get("x-forwarded-for");
//   if (forwardedFor) {
//     return forwardedFor.split(",")[0].trim();
//   }
//   return (
//     headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null
//   );
// }

// function validateAuditParams(
//   action: string,
//   entity: string,
//   entityId: string,
// ): boolean {
//   return !!(action?.trim() && entity?.trim() && entityId?.trim());
// }

// function sanitizeDetails(
//   details: Record<string, unknown>,
// ): Record<string, unknown> {
//   // إزالة أي بيانات حساسة قد تكون موجودة بالخطأ
//   const sensitiveFields = ["password", "token", "secret", "key"];
//   const sanitized = { ...details };

//   sensitiveFields.forEach((field) => {
//     if (field in sanitized) {
//       sanitized[field] = "***REDACTED***";
//     }
//   });

//   return sanitized;
// }

// // TODO: Audit Log Service Function
// export async function createAuditLog(
//   action: string,
//   entity: string,
//   entityId: string,
//   details: Record<string, unknown> = {},
// ) {
//   try {
//     // التحقق من المدخلات
//     if (!validateAuditParams(action, entity, entityId)) {
//       const warning = Errors.internal("معلمات سجل التدقيق غير صالحة");
//       console.warn(warning.message, { action, entity, entityId });
//       return;
//     }

//     let userId = await getCurrentUserId();
//     if (!userId) {
//       // (يمكن إرسال تنبيه داخلي إذا كنت تستخدم نظام مراقبة)
//       userId = "anonymous";
//     }
//     const { ipAddress, userAgent } = await getClientInfo();
//     // تنظيف البيانات الحساسة
//     const sanitizedDetails = sanitizeDetails(details);
//     const detailsJson = JSON.stringify(sanitizedDetails);

//     await db.insert(auditLog).values({
//       userId,
//       action: action.trim(),
//       entity: entity.trim(),
//       entityId: entityId.trim(),
//       details: detailsJson,
//       ipAddress,
//       userAgent,
//     });
//   } catch (error) {
//     const auditError = Errors.internal("فشل في تسجيل حدث التدقيق");
//     console.error(auditError.message, error);
//     // يمكن إضافة إشعار للمطورين هنا إذا لزم الأمر
//     // (يمكن إرسال تنبيه داخلي إذا كنت تستخدم نظام مراقبة)
//   }
// }

// export async function logFailedLogin(
//   email: string,
//   ipAddress: string | null = null,
// ) {
//   try {
//     const { ipAddress: headersIP, userAgent } = await getClientInfo();
//     const finalIP = ipAddress || headersIP;

//     const safeStringify = (obj: unknown): string => {
//       try {
//         return JSON.stringify(obj, (_key, value) =>
//           typeof value === "bigint" ? value.toString() : value,
//         );
//       } catch {
//         return JSON.stringify({ error: "Failed to serialize details" });
//       }
//     };

//     const detailsJson = safeStringify({
//       email: email.trim().toLowerCase(),
//       timestamp: new Date().toISOString(),
//     });
//     // const detailsJson = JSON.stringify({
//     //   email: email.trim().toLowerCase(),
//     //   timestamp: new Date().toISOString(),
//     // });

//     await db.insert(auditLog).values({
//       userId: "anonymous",
//       action: "auth.login.failed",
//       entity: "auth",
//       entityId: email.trim().toLowerCase(),
//       details: detailsJson,
//       ipAddress: finalIP,
//       userAgent,
//     });
//   } catch (error) {
//     const auditError = Errors.internal("فشل في تسجيل محاولة تسجيل دخول فاشلة");
//     console.error(auditError.message, error);
//   }
// }
