// src/lib/errors/action-handler.ts
import { AppError } from "@/lib/errors/error-types";
import { logError } from "@/lib/errors/logger";

/**
 * معالج موحد لنتائج النجاح
 */
export function handleSuccess<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}

/**
 * معالج موحد للأخطاء في Server Actions
 */
export function handleFailure(error: unknown) {
  if (error instanceof AppError) {
    logError(error);
    return {
      success: false as const,
      error: {
        code: error.code,
        message: error.userMessage,
      },
    };
  }

  // معالجة أخطاء Zod
  if (error instanceof Error && "issues" in error) {
    const zodError = error as { issues: { message: string }[] };
    const firstMessage =
      zodError.issues[0]?.message || "بيانات الإدخال غير صالحة";
    const appError = AppError.create(
      "VALIDATION_ERROR",
      `Zod validation failed: ${firstMessage}`,
      firstMessage,
    );
    logError(appError);
    return {
      success: false as const,
      error: {
        code: appError.code,
        message: appError.userMessage,
      },
    };
  }

  // خطأ غير متوقع
  const unknownError = AppError.create(
    "INTERNAL_SERVER_ERROR",
    "Unexpected error in server action",
    "حدث خطأ غير متوقع، يرجى المحاولة لاحقًا",
    error,
  );
  logError(unknownError);
  return {
    success: false as const,
    error: {
      code: unknownError.code,
      message: unknownError.userMessage,
    },
  };
}
