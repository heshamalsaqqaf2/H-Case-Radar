/**
 * Email Configuration
 * إعدادات نظام البريد الإلكتروني
 */

export const EMAIL_CONFIG = {
  // SMTP Settings
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "465", 10),
    secure: process.env.SMTP_SECURE !== "false", // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  },

  // Default From Address
  from: {
    name: process.env.SMTP_FROM_NAME || "نظام إدارة الشكاوى",
    email: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@h-case-radar.com",
  },

  // Retry Settings
  retry: {
    maxAttempts: Number.parseInt(process.env.EMAIL_MAX_ATTEMPTS || "3", 10),
    retryDelay: Number.parseInt(process.env.EMAIL_RETRY_DELAY || "60000", 10), // 1 minute
    backoffMultiplier: 2, // زيادة الوقت بالضعف مع كل محاولة
  },

  // Queue Settings
  queue: {
    maxConcurrent: Number.parseInt(process.env.EMAIL_QUEUE_CONCURRENT || "5", 10),
    processingInterval: Number.parseInt(process.env.EMAIL_QUEUE_INTERVAL || "30000", 10), // 30 seconds
  },

  // Rate Limiting
  rateLimit: {
    maxPerMinute: Number.parseInt(process.env.EMAIL_RATE_LIMIT_PER_MINUTE || "20", 10),
    maxPerHour: Number.parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR || "100", 10),
  },

  // Templates
  templates: {
    defaultLanguage: "ar",
    supportedLanguages: ["ar", "en"],
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Features
  features: {
    enableQueue: process.env.EMAIL_ENABLE_QUEUE !== "false",
    enableLogging: process.env.EMAIL_ENABLE_LOGGING !== "false",
    enableRetry: process.env.EMAIL_ENABLE_RETRY !== "false",
    enableTracking: process.env.EMAIL_ENABLE_TRACKING === "true",
  },

  // Production Settings
  production: {
    enabled: process.env.NODE_ENV === "production",
    testMode: process.env.EMAIL_TEST_MODE === "true",
    testRecipient: process.env.EMAIL_TEST_RECIPIENT,
  },
} as const;

/**
 * Validate Email Configuration
 * التحقق من صحة إعدادات البريد
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!EMAIL_CONFIG.smtp.auth.user) {
    errors.push("SMTP_USER is not configured");
  }

  if (!EMAIL_CONFIG.smtp.auth.pass) {
    errors.push("SMTP_PASS is not configured");
  }

  if (!EMAIL_CONFIG.from.email) {
    errors.push("SMTP_FROM is not configured");
  }

  if (EMAIL_CONFIG.production.testMode && !EMAIL_CONFIG.production.testRecipient) {
    errors.push("EMAIL_TEST_RECIPIENT is required when EMAIL_TEST_MODE is enabled");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get Effective Recipient
 * الحصول على المستلم الفعلي (مع مراعاة نمط الاختبار)
 */
export function getEffectiveRecipient(recipient: string | string[]): string | string[] {
  if (EMAIL_CONFIG.production.testMode && EMAIL_CONFIG.production.testRecipient) {
    console.warn(`[EMAIL TEST MODE] Redirecting email from ${recipient} to ${EMAIL_CONFIG.production.testRecipient}`);
    return EMAIL_CONFIG.production.testRecipient;
  }
  return recipient;
}

/**
 * Format From Address
 * تنسيق عنوان المرسل
 */
export function formatFromAddress(): string {
  return `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.email}>`;
}
