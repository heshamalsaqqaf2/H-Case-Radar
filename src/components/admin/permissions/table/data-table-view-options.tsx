"use client";

import {
  EyeClosedIcon,
  EyeOpenIcon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const [showSystemColumns, setShowSystemColumns] = useState(false);

  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    )
    .filter((column) => {
      if (showSystemColumns) return true;
      return !column.id.includes("system_");
    });

  const visibleColumnsCount = columns.filter((col) =>
    col.getIsVisible(),
  ).length;
  const totalColumnsCount = columns.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 lg:flex rounded-full"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
          <span className="ml-1 text-xs opacity-60">
            ({visibleColumnsCount}/{totalColumnsCount})
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Toggle Columns</span>
          <span className="text-xs text-muted-foreground">
            {visibleColumnsCount}/{totalColumnsCount}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* System Columns Toggle */}
        <div className="flex items-center justify-between px-2 py-1.5 text-sm">
          <Label htmlFor="system-columns" className="text-sm">
            Show system columns
          </Label>
          <Switch
            id="system-columns"
            checked={showSystemColumns}
            onCheckedChange={setShowSystemColumns}
          />
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-64 overflow-y-auto">
          {columns.map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize flex items-center justify-between"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                <span className="flex items-center">
                  {column.getIsVisible() ? (
                    <EyeOpenIcon className="mr-2 h-3 w-3" />
                  ) : (
                    <EyeClosedIcon className="mr-2 h-3 w-3" />
                  )}
                  {column.id === "select"
                    ? "Selection"
                    : column.id === "actions"
                      ? "Actions"
                      : column.id
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                </span>
                {column.id.includes("system_") && (
                  <span className="text-xs text-muted-foreground ml-2">
                    sys
                  </span>
                )}
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              columns.forEach((column) => {
                if (
                  ["select", "name", "resource", "action", "actions"].includes(
                    column.id,
                  )
                ) {
                  column.toggleVisibility(true);
                } else {
                  column.toggleVisibility(false);
                }
              });
            }}
          >
            Reset to Default
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
