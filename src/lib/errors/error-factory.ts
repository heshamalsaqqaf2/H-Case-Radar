// src/lib/errors/error-factory.ts
import { AppError } from "@/lib/errors/error-types";

/**
 * مصنع الأخطاء: دوال مساعدة لإنشاء أخطاء شائعة
 * جميع الرسائل التقنية بالإنجليزية (للمطورين)
 * جميع رسائل المستخدم بالعربية (أو حسب لغة المشروع)
 */
export const Errors = {
  /**
   * خطأ تحقق (مثل Zod validation)
   */
  validation(message: string): AppError {
    return AppError.create(
      "VALIDATION_ERROR",
      `Validation failed: ${message}`,
      "البيانات المدخلة غير صالحة. يرجى التحقق من الحقول.",
    );
  },

  /**
   * خطأ مصادقة (غير مسجل دخول)
   */
  authRequired(): AppError {
    return AppError.create(
      "AUTH_REQUIRED",
      "Authentication required",
      "يرجى تسجيل الدخول للوصول إلى هذه الميزة.",
    );
  },

  /**
   * خطأ صلاحيات (غير مسموح)
   */
  forbidden(action: string = "هذا الإجراء"): AppError {
    return AppError.create(
      "FORBIDDEN",
      `Access denied to ${action}`,
      `غير مسموح لك بتنفيذ ${action}.`,
    );
  },

  /**
   * خطأ مورد غير موجود
   */
  notFound(resource: string = "الموارد"): AppError {
    return AppError.create(
      "NOT_FOUND",
      `${resource} not found`,
      `${resource} الذي طلبته غير موجود.`,
    );
  },

  /**
   * تعارض في البيانات (مثل اسم دور مكرر)
   */
  conflict(message: string): AppError {
    return AppError.create(
      "CONFLICT",
      `Conflict: ${message}`,
      "يوجد تعارض في البيانات. يرجى المحاولة بقيمة مختلفة.",
    );
  },

  /**
   * خطأ في قاعدة البيانات
   */
  database(originalError?: unknown): AppError {
    return AppError.create(
      "DATABASE_ERROR",
      "Database operation failed",
      "فشل في تنفيذ العملية. يرجى المحاولة لاحقًا.",
      originalError,
    );
  },

  /**
   * خطأ داخلي غير متوقع
   */
  internal(originalError?: unknown): AppError {
    return AppError.create(
      "INTERNAL_SERVER_ERROR",
      "Internal server error",
      "حدث خطأ غير متوقع. تم إبلاغ فريق الدعم.",
      originalError,
    );
  },
};
