/**
 * Email Service - Main Export File
 * نقطة الدخول الرئيسية لخدمة البريد الإلكتروني
 */

// Config
export {
  EMAIL_CONFIG,
  formatFromAddress,
  getEffectiveRecipient,
  validateEmailConfig,
} from "./config/email-config";
export { EmailLogger, emailLogger } from "./core/email-logger";
// Core
export { EmailTransport, emailTransport } from "./core/email-transport";
// Re-export old send function for backwards compatibility
export { sendEmail as sendEmailLegacy } from "./send-email";
// Services
export { EmailService, emailService, sendBatchEmails, sendEmail } from "./services/email-service";
export type { SendEmailInput } from "./types/email-schemas";

// Schemas
export * from "./types/email-schemas";
// Types
export * from "./types/email-types";
