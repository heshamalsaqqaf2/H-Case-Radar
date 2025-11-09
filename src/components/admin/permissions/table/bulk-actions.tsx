"use client";

import type { Table } from "@tanstack/react-table";
import { Copy, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProtectedComponent } from "@/components/auth/protected-component";
import { AlertDialogDelete } from "@/components/shared/alert-dialog-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Permission } from "@/types/tanstack-table-types/permission";
import { exportToCSV } from "@/utils/tanstack-table/export-utils";

interface BulkActionsProps {
  table: Table<Permission>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

export function BulkActions({ table, onBulkDelete }: BulkActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkExport = () => {
    const selectedData = selectedRows.map((row) => row.original);
    exportToCSV(selectedData, `selected-permissions-${new Date().getTime()}`);
  };

  const handleCopyIds = async () => {
    const ids = selectedRows.map((row) => row.original.id).join(", ");
    await navigator.clipboard.writeText(ids);
    // toast.success('Copied IDs to clipboard');
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;

    setIsDeleting(true);
    try {
      const ids = selectedRows.map((row) => row.original.id);
      await onBulkDelete(ids);
      table.toggleAllPageRowsSelected(false);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 animate-in fade-in duration-300">
      <Badge variant="default" className="px-3 py-1.5 bg-blue-600">
        {selectedCount} selected
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            Bulk Actions
            <span className="ml-1 text-xs opacity-60">▼</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={handleBulkExport}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Selected
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleCopyIds}
            className="flex items-center"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy IDs
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <ProtectedComponent permission="permission.delete">
            <AlertDialogDelete
              itemName={`${selectedCount} permissions`}
              itemType="الصلاحيات المحددة"
              onConfirm={handleBulkDelete}
              isLoading={isDeleting}
              trigger={
                <DropdownMenuItem
                  className="flex items-center text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              }
            />
          </ProtectedComponent>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => table.toggleAllPageRowsSelected(false)}
        className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
      >
        ✕
      </Button>
    </div>
  );
}
