// src/components/admin/permissions/views/group-view.tsx

import {
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Server,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/tanstack-table-types/permission";
import { PermissionCardRow } from "./permission-card-row";

const groupPermissions = (
  permissions: Permission[],
): Record<string, Permission[]> => {
  return permissions.reduce(
    (acc, permission) => {
      const group = permission.resource;
      if (!acc[group]) acc[group] = [];
      acc[group].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );
};

const getResourceIcon = (resource: string) => {
  switch (resource.toLowerCase()) {
    case "user":
      return Users;
    case "product":
    case "item":
      return ShoppingBag;
    case "post":
    case "article":
      return FileText;
    default:
      return Server;
  }
};

interface GroupViewProps {
  permissions: Permission[];
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
  selectedPermissions: Set<string>;
  onSelectPermission: (id: string, checked: boolean) => void;
  onSelectAllInGroup: (group: string, checked: boolean) => void;
}

export function GroupView({
  permissions,
  onDelete,
  deletingId,
  selectedPermissions,
  onSelectPermission,
  onSelectAllInGroup,
}: GroupViewProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const groupedPermissions = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );
  const groupNames = useMemo(
    () => Object.keys(groupedPermissions).sort(),
    [groupedPermissions],
  );
  const toggleGroup = useCallback((group: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(group)) newSet.delete(group);
      else newSet.add(group);
      return newSet;
    });
  }, []);

  return (
    <div className="space-y-4">
      {groupNames.map((groupName) => {
        const groupPermissionsList = groupedPermissions[groupName];
        const isOpen = openGroups.has(groupName);
        const isFullySelected = groupPermissionsList.every((p) =>
          selectedPermissions.has(p.id),
        );
        const isPartiallySelected =
          groupPermissionsList.some((p) => selectedPermissions.has(p.id)) &&
          !isFullySelected;
        const Icon = getResourceIcon(groupName);
        return (
          <Collapsible
            key={groupName}
            open={isOpen}
            onOpenChange={() => toggleGroup(groupName)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between rounded-xl border bg-card p-4 hover:bg-accent/50 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Checkbox
                    checked={
                      isFullySelected
                        ? true
                        : isPartiallySelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) =>
                      onSelectAllInGroup(groupName, !!checked)
                    }
                  />
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {groupName.replace(/_/g, " ")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage access for this resource
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {groupPermissionsList.length} permissions
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {groupPermissionsList.map((permission) => (
                <div key={permission.id} className="ml-12">
                  <PermissionCardRow
                    permission={permission}
                    isSelected={selectedPermissions.has(permission.id)}
                    onSelect={(checked) =>
                      onSelectPermission(permission.id, checked)
                    }
                    onDelete={onDelete}
                    isDeleting={deletingId === permission.id}
                  />
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
