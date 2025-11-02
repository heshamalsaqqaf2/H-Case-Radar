// src/components/admin/permissions/table/permission-card-row.tsx
"use client";
import { Copy, Edit, MoreHorizontal, Shield, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ProtectedComponent } from "@/components/auth/protected-component";
import { AlertDialogDelete } from "@/components/shared/alert-dialog-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/permission";

const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case "create":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "read":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "update":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "delete":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

interface PermissionCardRowProps {
  permission: Permission;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}

export function PermissionCardRow({
  permission,
  isSelected,
  onSelect,
  onDelete,
  isDeleting,
}: PermissionCardRowProps) {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopyId = useCallback(async () => {
    await navigator.clipboard.writeText(permission.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [permission.id]);
  const handleDelete = useCallback(async () => {
    await onDelete(permission.id, permission.name);
  }, [permission.id, permission.name, onDelete]);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        isSelected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
        className="mt-1 border-primary"
        aria-label={`Select ${permission.name}`}
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg leading-tight">
              {permission.name}
            </h3>
            {permission.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {permission.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {permission.conditions ? (
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                <Zap className="mr-1 h-3 w-3" /> Dynamic
              </Badge>
            ) : (
              <Badge variant="secondary" className="border-dashed">
                <Shield className="mr-1 h-3 w-3" /> Static
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="font-mono uppercase">
            {permission.resource.replace(/_/g, " ")}
          </Badge>
          <span className="text-muted-foreground">•</span>
          <Badge
            className={cn(
              "capitalize",
              getActionBadgeVariant(permission.action),
            )}
          >
            {permission.action}
          </Badge>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            {isCopied ? "Copied!" : "Copy ID"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ProtectedComponent permission="permission.edit">
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/permissions/${permission.id}/edit`}
                className="flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
          </ProtectedComponent>
          <ProtectedComponent permission="permission.delete">
            <AlertDialogDelete
              itemName={permission.name}
              itemType="الصلاحية"
              onConfirm={handleDelete}
              isLoading={isDeleting}
              trigger={
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              }
            />
          </ProtectedComponent>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
