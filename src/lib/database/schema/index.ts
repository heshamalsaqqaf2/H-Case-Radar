// Re-export جميع المخططات من الملفات المنفصلة
export * from "./audit-schema";
export * from "./auth-schema";
export * from "./authorization-schema";
export * from "./complaints-schema";

// تصدير كائن شامل لجميع الجداول
import * as audit from "./audit-schema";
import * as authentication from "./auth-schema";
import * as authorization from "./authorization-schema";
import * as complaints from "./complaints-schema";

export const schema = {
  ...authentication,
  ...authorization,
  ...audit,
  ...complaints,
};

// نوع شامل لجميع الجداول
export type DatabaseSchema = typeof schema;

// تصدير أنواع رئيسية للاستخدام العام
export type { auditLog } from "./audit-schema";
export type { Session, User } from "./auth-schema";
export type { Permission, Role } from "./authorization-schema";
export type { Complaint } from "./complaints-schema";
