// src/lib/errors/error-types.ts

/**
 * @name ErrorCode
 * @description The error code
 * @type {ErrorCode}
 * @enum {string}
 * @readonly
 * @enumMember {string} VALIDATION_ERROR - The validation error code
 * @enumMember {string} AUTH_REQUIRED - The authentication required error code
 * @enumMember {string} FORBIDDEN - The forbidden error code
 * @enumMember {string} NOT_FOUND - The not found error code
 * @enumMember {string} CONFLICT - The conflict error code
 * @enumMember {string} DATABASE_ERROR - The database error code
 * @enumMember {string} NETWORK_ERROR - The network error code
 * @enumMember {string} INTERNAL_SERVER_ERROR - The internal server error code
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "INTERNAL_SERVER_ERROR";

/**
 * @name AppErrorMetadata
 * @description The metadata for the error
 * @type {AppErrorMetadata}
 * 
 * @property {ErrorCode} code - The error code
 * @property {string} message - The error message
 * @property {string} userMessage - The user message
 * @property {unknown} originalError - The original error
 * @property {number} timestamp - The timestamp
 * @returns {AppErrorMetadata}
 * 
 * @example
 * const metadata: AppErrorMetadata = {
   code: "VALIDATION_ERROR",
   message: "Validation error",
   userMessage: "Validation error",
   originalError: null,
   timestamp: Date.now(),
 }
 */
export interface AppErrorMetadata {
  code: ErrorCode;
  message: string;
  userMessage: string;
  originalError?: unknown;
  timestamp: number;
}

/**
 * @name AppError
 * @description The error class
 * @type {AppError}
 * @param {AppErrorMetadata} metadata - The metadata for the error
 * @returns {AppError}
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly originalError?: unknown;
  public readonly timestamp: number;

  constructor(metadata: AppErrorMetadata) {
    super(metadata.message);
    this.code = metadata.code;
    this.userMessage = metadata.userMessage;
    this.originalError = metadata.originalError;
    this.timestamp = metadata.timestamp;
    this.name = "AppError";
  }

  static create(
    code: ErrorCode,
    message: string,
    userMessage?: string,
    original?: unknown,
  ) {
    return new AppError({
      code,
      message,
      userMessage: userMessage || message,
      originalError: original,
      timestamp: Date.now(),
    });
  }
}
