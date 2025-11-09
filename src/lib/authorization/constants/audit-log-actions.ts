// src/lib/authorization/constants/audit-log-actions.ts

/**
 * ثوابت موحدة لأحداث السجل الأمني (Audit Log Actions)
 * تُستخدم لتوحيد أسماء الأحداث عبر النظام وتمكين التحقق النوعي
 *
 * التسميات تتبع نمط: "resource.action"
 * - resource: الكيان المتأثر (user, role, permission, ...)
 * - action: العملية المنفذة (create, update, delete, view, access, assign_*, ...)
 *
 * ملاحظات:
 * - `view`: يشير إلى عرض تفاصيل كيان محدد (مثل: user/123)
 * - `access`: يشير إلى دخول قسم أو صفحة عامة (مثل: /admin/users)
 */

export const AUDIT_LOG_ACTIONS = {
  USER: {
    CREATE: "user.create",
    UPDATE: "user.update",
    DELETE: "user.delete",
    VIEW: "user.view",
    ACCESS: "user.access",
    MANAGE: "user.manage",
    LOGIN: "user.login",
    BAN: "user.ban",
    UNBAN: "user.unban",
    UPDATE_PROFILE: "user.update_profile",
    ASSIGN_ROLE: "user.assign_role",
    REMOVE_ROLE: "user.remove_role",
    ASSIGN_PERMISSIONS: "user.assign_permissions",
  },
  ROLE: {
    CREATE: "role.create",
    UPDATE: "role.update",
    DELETE: "role.delete",
    VIEW: "role.view",
    ACCESS: "role.access",
    ASSIGN_PERMISSIONS: "role.assign_permissions",
    ASSIGN_USERS: "role.assign_users",
  },
  PERMISSION: {
    CREATE: "permission.create",
    UPDATE: "permission.update",
    DELETE: "permission.delete",
    VIEW: "permission.view",
    ACCESS: "permission.access",
    ASSIGN_ROLES: "permission.assign_roles",
  },
  COMPLAINT: {
    CREATE: "complaint.create",
    UPDATE: "complaint.update",
    DELETE: "complaint.delete",
    VIEW: "complaint.view",
    ACCESS: "complaint.access",
    ASSIGN_USERS: "complaint.assign_users",
  },
  STATISTICS: {
    ACCESS: "statistics.access",
    VIEW: "statistics.view",
    SEARCH: "statistics.search",
  },
  REPORT: {
    CREATE: "report.create",
    UPDATE: "report.update",
    DELETE: "report.delete",
    VIEW: "report.view",
    ACCESS: "report.access",
  },
  SETTINGS: {
    UPDATE: "settings.update",
    VIEW: "settings.view",
    ACCESS: "settings.access",
  },
  AUDIT_LOG: {
    VIEW: "audit.view",
    ACCESS: "audit.access",
    EXPORT: "audit.export",
  },
  DATABASE_SEEDER: {
    RUN: "seeder.run",
    REVERT: "seeder.revert",
    VIEW: "seeder.view",
    ACCESS: "seeder.access",
  },
  SYSTEM: {
    MANAGE: "system.manage",
    CONFIGURE: "system.configure",
    VIEW: "system.view",
    ACCESS: "system.access",
  },
  ADMIN: {
    CONFIGURE: "admin.configure",
    VIEW: "admin.view",
    ACCESS: "admin.access",
  },
  DASHBOARD: {
    CONFIGURE: "dashboard.configure",
    VIEW: "dashboard.view",
    ACCESS: "dashboard.access",
  },
} as const;

// TODO: نوع TypeScript لتمكين التحقق النوعي ───────────────────────────────────
export type AuditAction =
  (typeof AUDIT_LOG_ACTIONS)[keyof typeof AUDIT_LOG_ACTIONS][keyof (typeof AUDIT_LOG_ACTIONS)[keyof typeof AUDIT_LOG_ACTIONS]];
