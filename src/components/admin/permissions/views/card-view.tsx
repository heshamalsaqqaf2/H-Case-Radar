// src/components/admin/permissions/views/card-view.tsx

import type { Permission } from "@/types/tanstack-table-types/permission";
import { PermissionCardRow } from "./permission-card-row";

interface CardViewProps {
  permissions: Permission[];
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
  selectedPermissions: Set<string>;
  onSelectPermission: (id: string, checked: boolean) => void;
}

export function CardView({
  permissions,
  onDelete,
  deletingId,
  selectedPermissions,
  onSelectPermission,
}: CardViewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {permissions.map((permission) => (
        <PermissionCardRow
          key={permission.id}
          permission={permission}
          isSelected={selectedPermissions.has(permission.id)}
          onSelect={(checked) => onSelectPermission(permission.id, checked)}
          onDelete={onDelete}
          isDeleting={deletingId === permission.id}
        />
      ))}
    </div>
  );
}
