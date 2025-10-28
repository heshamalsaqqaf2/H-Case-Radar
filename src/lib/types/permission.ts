// lib/types/permission.ts
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
