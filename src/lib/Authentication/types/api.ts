// lib/types/api.ts
export interface ApiSuccessResponse<T = void> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  status?: number;
}

export type ApiResponse<T = void> = ApiSuccessResponse<T> | ApiErrorResponse;
