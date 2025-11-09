// src/lib/authorization/types/permissions.ts
export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  conditions: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafePermission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  conditions: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
