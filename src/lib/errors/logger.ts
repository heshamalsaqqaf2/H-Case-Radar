// src/lib/errors/logger.ts
import { AppError } from "@/lib/errors/error-types";

/**
 * سجل الأخطاء المركزي
 * - في التطوير: يطبع في الطرفية
 * - في الإنتاج: يُرسل إلى نظام مراقبة (مثل Sentry)
 */
export function logError(error: AppError | unknown): void {
  if (error instanceof AppError) {
    const logEntry = {
      level: "error",
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      timestamp: new Date(error.timestamp).toISOString(),
      stack: error.stack,
    };

    if (process.env.NODE_ENV === "production") {
      // 🚀 أرسل إلى Sentry أو Datadog أو نظام المراقبة الخاص بك
      // مثال مع Sentry:
      // if (typeof window === "undefined") {
      //   const { captureException } = require("@sentry/nextjs");
      //   captureException(error);
      // }
      console.error("[PROD ERROR]", logEntry);
    } else {
      console.error("[DEV ERROR]", logEntry);
    }
  } else {
    // خطأ غير معروف
    console.error("[UNKNOWN ERROR]", error);
  }
}
