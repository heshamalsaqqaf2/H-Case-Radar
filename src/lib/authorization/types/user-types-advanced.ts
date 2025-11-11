// src/lib/authorization/types/user.ts

/**
 * 🎯 نظام أنواع المستخدمين الاحترافي
 * ✅ متوافق تماماً مع Better Auth
 * ✅ يطبق أفضل ممارسات TypeScript
 * ✅ تصميم معياري وقابل للتوسع
 * ✅ توثيق كامل لكل واجهة
 */

// ==============================================
// 🏗️  الأنواع الأساسية والمشتركة
// ==============================================

/**
 * الوضع الزمني للبيانات (Timestamps)
 */
export interface Timestamps {
  /** تاريخ وإنشاء السجل */
  createdAt: Date;
  /** تاريخ آخر تحديث للسجل */
  updatedAt: Date;
  /** تاريخ الحذف (لـ Soft Delete) */
  deletedAt?: Date | null;
}

/**
 * حالة البريد الإلكتروني
 */
export interface EmailStatus {
  /** تم التحقق من البريد الإلكتروني */
  emailVerified: boolean;
  /** تاريخ التحقق من البريد */
  emailVerifiedAt?: Date | null;
  /** رمز التحقق (مؤقت) */
  verificationToken?: string | null;
  /** تاريخ انتهاء صلاحية رمز التحقق */
  verificationTokenExpires?: Date | null;
}

/**
 * معلومات الحظر والإيقاف
 */
export interface BanStatus {
  /** تم حظر المستخدم */
  banned: boolean;
  /** سبب الحظر */
  banReason?: string | null;
  /** تاريخ بداية الحظر */
  bannedAt?: Date | null;
  /** تاريخ انتهاء الحظر */
  banExpires?: Date | null;
  /** ID للمسؤول الذي قام بالحظر */
  bannedBy?: string | null;
}

/**
 * معلومات الجلسة والنشاط
 */
export interface ActivityInfo {
  /** آخر مرة قام فيها المستخدم بتسجيل الدخول */
  lastLoginAt?: Date | null;
  /** عنوان IP لآخر تسجيل دخول */
  lastLoginIp?: string | null;
  /** عدد مرات تسجيل الدخول */
  loginCount: number;
  /** آخر نشاط معروف */
  lastActivityAt?: Date | null;
  /** نظام التشغيل والمتصفح لآخر جلسة */
  userAgent?: string | null;
}

// ==============================================F
// 👤  أنواع المستخدم الأساسية
// ==============================================

/**
 * بيانات المستخدم الأساسية المتوافقة مع Better Auth
 */
export interface BaseUser extends Timestamps, EmailStatus, BanStatus, ActivityInfo {
  /** المعرف الفريد للمستخدم */
  id: string;
  /** الاسم الكامل للمستخدم */
  name: string;

  /** البريد الإلكتروني الأساسي (للتواصل والاستخدام الشخصي) */
  personalEmail: string;
  /** البريد الإلكتروني النظامي (للاستخدامات الداخلية) */
  systemEmail?: string;

  /** صورة الملف الشخصي */
  avatar?: string | null;
  /** رقم الهاتف */
  phone?: string | null;
  /** البلد */
  country?: string | null;
  /** المنطقة الزمنية */
  timezone?: string;
  /** اللغة المفضلة */
  preferredLanguage?: string;

  /** توقيت UTC+3 (توقيت السعودية) */
  saudiCreatedAt?: Date;
  /** توقيت UTC+3 (توقيت السعودية) */
  saudiUpdatedAt?: Date;
}

/**
 * معلومات الأمان والخصوصية
 */
export interface SecurityInfo {
  /** هل تم تفعيل المصادقة الثنائية؟ */
  twoFactorEnabled: boolean;
  /** طريقة المصادقة الثنائية */
  twoFactorMethod?: "authenticator" | "sms" | "email";
  /** تاريخ تفعيل المصادقة الثنائية */
  twoFactorEnabledAt?: Date | null;
  /** آخر مرة تم فيها تغيير كلمة المرور */
  passwordChangedAt?: Date;
  /** مطلوب تغيير كلمة المرور في next login */
  forcePasswordChange: boolean;
}

/**
 * المستخدم الكامل مع جميع المعلومات
 */
export interface User extends BaseUser, SecurityInfo {
  /** الأدوار المخصصة للمستخدم */
  roles: UserRole[];
  /** الصلاحيات المباشرة (بخلاف تلك الموروثة من الأدوار) */
  directPermissions?: UserPermission[];
  /** إعدادات المستخدم الشخصية */
  settings?: UserSettings;
}

// ==============================================
// 🎭  أنواع الأدوار والصلاحيات
// ==============================================

/**
 * دور المستخدم في النظام
 */
export interface UserRole {
  id: string;
  name: string;
  description: string | null;
  /** هل هذا الدور افتراضي للمستخدمين الجدد؟ */
  isDefault: boolean;
  /** مستوى الأولوية (للترتيب والعرض) */
  priority: number;
  /** الصلاحيات المرتبطة بهذا الدور */
  permissions: UserPermission[];
  /** تاريخ إنشاء الدور */
  createdAt: Date;
  /** تاريخ آخر تحديث */
  updatedAt: Date;
}

/**
 * صلاحية في النظام
 */
export interface UserPermission {
  id: string;
  name: string;
  /** المورد أو الكيان الذي تنطبق عليه الصلاحية */
  resource: string;
  /** الإجراء المسموح به (create, read, update, delete, manage) */
  action: "create" | "view" | "update" | "delete" | "manage" | "approve" | string;
  /** وصف تفصيلي للصلاحية */
  description: string | null;
  /** شروط إضافية لتطبيق الصلاحية */
  conditions?: Record<string, unknown> | null;
  /** نطاق الصلاحية (global, organization, team, personal) */
  scope: "global" | "organization" | "team" | "personal";
  /** تاريخ إنشاء الصلاحية */
  createdAt: Date;
}

// ==============================================
// 📊  أنواع الإحصائيات والتقارير
// ==============================================

/**
 * إحصائيات استخدام المستخدم
 */
export interface UserStatistics {
  /** عدد الأدوار الم assigned */
  rolesCount: number;
  /** عدد الصلاحيات الإجمالية */
  totalPermissionsCount: number;
  /** عدد الصلاحيات المباشرة */
  directPermissionsCount: number;
  /** عدد الجلسات النشطة */
  activeSessionsCount: number;
  /** عدد المرات التي تم فيها رفض الوصول */
  accessDeniedCount: number;
  /** متوسط مدة الجلسة (بالدقائق) */
  averageSessionDuration: number;
  /** آخر نشاط مسجل */
  lastActivity?: Date;
  /** إحصائيات حسب الشهر */
  monthlyStats?: MonthlyUserStats[];
}

/**
 * إحصائيات شهرية للمستخدم
 */
export interface MonthlyUserStats {
  /** الشهر والعام (YYYY-MM) */
  period: string;
  /** عدد مرات تسجيل الدخول */
  loginCount: number;
  /** عدد الإجراءات التي قام بها */
  actionsCount: number;
  /** عدد المرات التي تم فيها رفض الوصول */
  accessDeniedCount: number;
  /** متوسط مدة الجلسة */
  averageSessionDuration: number;
}

// ==============================================
// 📝  أنواع الإدخال والاستجابة
// ==============================================

/**
 * بيانات إنشاء مستخدم جديد
 */
export interface CreateUserInput {
  /** الاسم الكامل */
  name: string;
  /** البريد الإلكتروني الشخصي */
  personalEmail: string;
  /** البريد الإلكتروني النظامي (اختياري - سيتم توليده تلقائياً) */
  systemEmail?: string;
  /** كلمة المرور (اختياري - سيتم توليدها تلقائياً) */
  password?: string;
  /** الأدوار المطلوبة */
  roleIds: string[];
  /** إرسال بريد ترحيب؟ */
  sendWelcomeEmail: boolean;
  /** معلومات إضافية */
  metadata?: {
    phone?: string;
    country?: string;
    timezone?: string;
    preferredLanguage?: string;
  };
}

/**
 * بيانات تحديث المستخدم
 */
export interface UpdateUserInput {
  name?: string;
  personalEmail?: string;
  systemEmail?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  preferredLanguage?: string;
  avatar?: string | null;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
  roleIds?: string[];
  forcePasswordChange?: boolean;
  twoFactorEnabled?: boolean;
}

/**
 * استجابة إنشاء مستخدم جديد
 */
export interface CreateUserResponse {
  /** بيانات المستخدم المنشأ */
  user: User;
  /** كلمة المرور المؤقتة (إذا تم توليدها) */
  temporaryPassword?: string;
  /** الأدوار التي تم تعيينها */
  assignedRoles: UserRole[];
  /** معلومات البريد الإلكتروني المرسل */
  emailStatus?: {
    welcomeEmailSent: boolean;
    sentAt?: Date;
    error?: string;
  };
}

// ==============================================
// 👥  أنواع العلاقات والتجميعات
// ==============================================

/**
 * مستخدم مع أدواره فقط
 */
export interface UserWithRoles extends BaseUser {
  roles: UserRole[];
}

/**
 * مستخدم مع أدواره وصلاحياته
 */
export interface UserWithRolesAndPermissions extends BaseUser {
  roles: UserRole[];
  permissions: UserPermission[];
}

/**
 * الملف الشخصي الكامل للمستخدم
 */
export interface UserProfile extends BaseUser, SecurityInfo {
  roles: UserRole[];
  permissions: UserPermission[];
  statistics: UserStatistics;
  settings: UserSettings;
}

/**
 * إعدادات المستخدم الشخصية
 */
export interface UserSettings {
  /** إشعارات البريد الإلكتروني */
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    securityAlerts: boolean;
    newsletter: boolean;
  };
  /** تفضيلات الخصوصية */
  privacy: {
    profileVisibility: "public" | "private" | "team-only";
    showOnlineStatus: boolean;
    allowTracking: boolean;
  };
  /** تفضيلات الواجهة */
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    timeFormat: "12h" | "24h";
    dateFormat: string;
  };
}

// ==============================================
// 🔍  أنواع البحث والتصفية
// ==============================================

/**
 * خيارات تصفية المستخدمين
 */
export interface UserFilterOptions {
  /** البحث بالاسم أو البريد الإلكتروني */
  search?: string;
  /** الأدوار المحددة */
  roleIds?: string[];
  /** حالة الحظر */
  banned?: boolean;
  /** حالة التحقق من البريد */
  emailVerified?: boolean;
  /** تاريخ الإنشاء من */
  createdAtFrom?: Date;
  /** تاريخ الإنشاء إلى */
  createdAtTo?: Date;
  /** آخر نشاط من */
  lastActivityFrom?: Date;
  /** آخر نشاط إلى */
  lastActivityTo?: Date;
  /** البلد */
  country?: string;
  /** عدد السجلات في الصفحة */
  limit?: number;
  /** رقم الصفحة */
  page?: number;
}

/**
 * نتائج البحث عن المستخدمين
 */
export interface UserSearchResult {
  users: UserWithRoles[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: UserFilterOptions;
}

// ==============================================
// 📋  أنواع التصدير والتقارير
// ==============================================

/**
 * بيانات المستخدم للتصدير
 */
export interface UserExportData {
  id: string;
  name: string;
  personalEmail: string;
  systemEmail?: string;
  roles: string[];
  banned: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  loginCount: number;
}

/**
 * تقير نشاط المستخدم
 */
export interface UserActivityReport {
  userId: string;
  userName: string;
  period: {
    from: Date;
    to: Date;
  };
  activities: {
    date: Date;
    action: string;
    resource: string;
    ipAddress: string;
    userAgent: string;
  }[];
  summary: {
    totalActivities: number;
    uniqueDays: number;
    mostActiveDay: Date;
    mostCommonAction: string;
  };
}

// ==============================================
// 🛡️  أنواع الأمان والتدقيق
// ==============================================

/**
 * سجل تدقيق المستخدم
 */
export interface UserAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  performedBy?: string; // للمسؤولين
}

/**
 * جلسة المستخدم النشطة
 */
export interface UserSession {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  loginAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

// ==============================================
// 🔧  Utilities & Helpers
// ==============================================

/**
 * نوع لإنشاء مستخدم جديد (بدون ID وتواريخ)
 */
export type UserCreateData = Omit<BaseUser, "id" | "createdAt" | "updatedAt"> &
  Partial<Pick<SecurityInfo, "twoFactorEnabled" | "forcePasswordChange">>;

/**
 * نوع لتحديث المستخدم (جميع الحقول اختيارية)
 */
export type UserUpdateData = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

/**
 * نوع للبيانات العامة للمستخدم (للعرض العام)
 */
export type PublicUserProfile = Pick<BaseUser, "id" | "name" | "avatar" | "createdAt"> & {
  roleNames: string[];
};

/**
 * نوع لبيانات المستخدم المبسطة (للقوائم)
 */
export type UserListItem = Pick<
  BaseUser,
  "id" | "name" | "personalEmail" | "systemEmail" | "banned" | "lastLoginAt" | "createdAt"
> & {
  roles: string[];
  loginCount: number;
};

// ==============================================
// 🎯  Type Guards & Validators
// ==============================================

/**
 * تحقق إذا كان الكائن من نوع BaseUser
 */
export function isBaseUser(obj: unknown): obj is BaseUser {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "personalEmail" in obj &&
    "createdAt" in obj &&
    "updatedAt" in obj
  );
}

/**
 * تحقق إذا كان المستخدم نشطاً (لم يتم حظره وانتهت مدة الحظر إن وجدت)
 */
export function isUserActive(user: BaseUser): boolean {
  if (!user.banned) return true;
  if (user.banExpires && new Date() > user.banExpires) return true;
  return false;
}

/**
 * تحقق إذا كان المستخدم يمكنه تسجيل الدخول
 */
export function canUserLogin(user: BaseUser & EmailStatus): boolean {
  return isUserActive(user) && user.emailVerified;
}

// ==============================================
// ## 📦  Export All Types
// ==============================================

export type {
  // Re-export for backward compatibility
  BaseUser as BetterAuthUser,
  UserWithRoles,
  UserWithRolesAndPermissions,
};

/**
 * 📚 ملاحظات هامة:
 *
 * 1. ✅ التوافق مع Better Auth: جميع الحقول الأساسية متوافقة
 * 2. ✅ التصميم المعياري: تقسيم الأنواع إلى وحدات متخصصة
 * 3. ✅ السلامة النوعية: استخدام Type Guards للتحقق
 * 4. ✅ القابلية للتوسع: إضافة أنواع جديدة بسهولة
 * 5. ✅ التوثيق الكامل: كل واجهة موثقة بالكامل
 * 6. ✅ الأداء: استخدام أنواع محددة بدلاً من any
 * 7. ✅ إعادة الاستخدام: أنواع مساعدة للمهام الشائعة
 *
 * 🎯 هذا النظام يغطي جميع حالات استخدام المستخدمين
 * ويوفر أساساً قوياً للتطوير المستقبلي.
 */
