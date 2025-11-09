// src/lib/errors/error-types.ts

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "INTERNAL_SERVER_ERROR";

export interface AppErrorMetadata {
  code: ErrorCode;
  message: string;
  userMessage: string;
  originalError?: unknown;
  timestamp: number;
}

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
