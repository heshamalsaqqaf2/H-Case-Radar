"use client";

import type { Table } from "@tanstack/react-table";
import { Database, Download, FileText, RotateCcw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/table/use-debounce";
import type { Permission } from "@/types/permission";
import {
  type ExportFormat,
  exportToCSV,
  exportToExcel,
  exportToJSON,
} from "@/utils/export-utils";
import { BulkActions } from "./bulk-actions";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface PermissionsTableToolbarProps {
  table: Table<Permission>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  isResetting: boolean;
  onReset: () => void;
  data: Permission[];
  resources: { value: string; label: string }[];
  actions: { value: string; label: string }[];
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

export function PermissionsTableToolbar({
  table,
  globalFilter,
  onGlobalFilterChange,
  isResetting,
  onReset,
  data,
  resources,
  actions,
  onBulkDelete,
}: PermissionsTableToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [localSearch, setLocalSearch] = useState(globalFilter);

  // استخدام debounce للبحث المحلي فقط
  const debouncedSearch = useDebounce(localSearch, 300);

  // مزامنة البحث مع global filter مرة واحدة عند تغيير debouncedSearch
  useEffect(() => {
    onGlobalFilterChange(debouncedSearch);
  }, [debouncedSearch, onGlobalFilterChange]);

  // مزامنة localSearch مع globalFilter عند التحميل الأولي
  useEffect(() => {
    setLocalSearch(globalFilter);
  }, [globalFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setIsExporting(true);
      try {
        const filteredData = table
          .getFilteredRowModel()
          .rows.map((row) => row.original);

        switch (format) {
          case "csv":
            exportToCSV(filteredData, `permissions-${new Date().getTime()}`);
            break;
          case "json":
            exportToJSON(filteredData, `permissions-${new Date().getTime()}`);
            break;
          case "excel":
            await exportToExcel(
              filteredData,
              `permissions-${new Date().getTime()}`,
            );
            break;
        }
      } catch (error) {
        console.error("Export failed:", error);
      } finally {
        setTimeout(() => setIsExporting(false), 1000);
      }
    },
    [table],
  );

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    const names = data.map((p) => p.name);
    const resources = data.map((p) => p.resource);
    return [...new Set([...names, ...resources])].slice(0, 5);
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, resource, or description..."
              value={localSearch}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="h-10 w-full rounded-full border-none bg-muted/50 pl-10 pr-4 text-sm shadow-inner transition-all duration-200 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring"
              list="search-suggestions"
            />
            <datalist id="search-suggestions">
              {searchSuggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>

            {/* Search Stats */}
            {debouncedSearch && (
              <Badge
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
              >
                {totalCount} found
              </Badge>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <DataTableFacetedFilter
              column={table.getColumn("resource")}
              title="Resource"
              options={resources}
            />
            <DataTableFacetedFilter
              column={table.getColumn("action")}
              title="Action"
              options={actions}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <BulkActions table={table} onBulkDelete={onBulkDelete} />

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={isResetting}
            className="rounded-full shrink-0"
            title="Reset all filters and sorting"
          >
            <RotateCcw
              className={`mr-2 h-4 w-4 ${isResetting ? "animate-spin" : ""}`}
            />
            Reset
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting || data.length === 0}
                className="rounded-full shrink-0"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
                <span className="ml-1 text-xs opacity-60">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleExport("csv")}
                className="flex items-center"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("json")}
                className="flex items-center"
              >
                <Database className="mr-2 h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("excel")}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Selected Count Badge */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Badge variant="secondary" className="px-3 py-1.5">
            {selectedCount} of {totalCount} permissions selected
          </Badge>
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.toggleAllPageRowsSelected(false)}
            className="h-auto p-1 text-xs"
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  );
}
