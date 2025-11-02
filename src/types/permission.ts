export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  conditions: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  systemManaged?: boolean;
}

// أو إذا كنت تريد الحفاظ على التسميات القديمة
// export interface Permission {
//   id: string;
//   name: string;
//   description: string | null;
//   resource: string;
//   action: string;
//   conditions: unknown;
//   created_at: string;
//   updated_at: string;
//   created_by?: string;
//   system_managed?: boolean;
// }

// استخدم النوع الذي يتطابق مع بيانات API الخاصة بك

// export interface Permission {
//   id: string;
//   name: string;
//   description: string | null;
//   resource: string;
//   action: string;
//   conditions: unknown;
//   created_at: string; // أو Date إذا كان يتم تحويله
//   updated_at: string; // أو Date إذا كان يتم تحويله
//   created_by?: string;
//   system_managed?: boolean;
// }

// إذا كانت البيانات تستخدم createdAt بدلاً من created_at
export interface PermissionFromAPI {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  conditions: unknown;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy?: string;
  systemManaged?: boolean;
}

// دالة لتحويل البيانات من API إلى النوع المحلي
export function transformPermissionFromAPI(
  apiPermission: PermissionFromAPI,
): Permission {
  return {
    ...apiPermission,
    createdAt:
      typeof apiPermission.createdAt === "string"
        ? apiPermission.createdAt
        : apiPermission.createdAt.toISOString(),
    updatedAt:
      typeof apiPermission.updatedAt === "string"
        ? apiPermission.updatedAt
        : apiPermission.updatedAt.toISOString(),
    createdBy: apiPermission.createdBy,
    systemManaged: apiPermission.systemManaged,
  };
}

export interface PermissionStatistics {
  total: number;
  static: number;
  dynamic: number;
  byResource: Record<string, number>;
  byAction: Record<string, number>;
  recentlyAdded: Permission[];
}

export interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
}

// Types for TanStack Table
export type SortingState = any[];
export type ColumnFiltersState = any[];
export type VisibilityState = any;
export type RowSelectionState = any;
