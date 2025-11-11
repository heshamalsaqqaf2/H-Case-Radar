// src/lib/types/api.ts
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  error?: never;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  data?: never;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ✅ أنواع مساعدة للـ queries (مستخدمة فعلياً)
export interface QueryOptions<T> {
  initialData?: ApiResponse<T>;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}
