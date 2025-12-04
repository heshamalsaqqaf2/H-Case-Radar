/**
 * سياق طلب الوصول — يُستخدم في تقييم سياسات ABAC
 */
export interface AccessContext {
  userId: string;
  resource?: string;
  action?: string;
  environment?: Record<string, unknown>;
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

export interface SafePermission {
  name: string;
  resource: string;
  action: string;
  conditions: Record<string, unknown> | null;
}