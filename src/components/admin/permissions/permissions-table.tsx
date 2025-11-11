/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { BarChart3, Download, Edit, Key, MoreHorizontal, Shield, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertDialogDelete } from "@/components/shared/alert-dialog-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePerformance } from "@/hooks/data-table/use-performance";
import {
  useDeletePermission,
  usePermissions,
} from "@/lib/authorization/hooks/admin/use-permissions";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/tanstack-table-types/permission";
import { transformPermissionFromAPI } from "@/types/tanstack-table-types/permission";
import { PermissionsTableToolbar } from "./table/permissions-table-toolbar";
import { StatisticsPanel } from "./table/statistics-panel2";

const INITIAL_TABLE_STATE = {
  sorting: [] as SortingState,
  columnFilters: [] as ColumnFiltersState,
  globalFilter: "",
  columnVisibility: {} as VisibilityState,
  rowSelection: {} as RowSelectionState,
};

const TABLE_STATE_KEY = "permissions-table-state-v2";

// Helper function for action badge colors
const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case "create":
      return "default";
    case "read":
      return "secondary";
    case "update":
      return "outline";
    case "delete":
      return "destructive";
    default:
      return "secondary";
  }
};

// Skeleton Component
const TableSkeleton = ({ pageSize = 15 }: { pageSize?: number }) => (
  <>
    {Array.from({ length: pageSize }).map((_, index) => (
      <TableRow key={`skeleton-${index}`} className="border-b border-border/50 animate-pulse">
        <TableCell className="py-4">
          <div className="flex items-center space-x-3">
            <div className="h-4 bg-muted rounded w-4 border border-primary/20" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </TableCell>
        <TableCell className="py-4">
          <div className="h-6 bg-muted rounded w-20" />
        </TableCell>
        <TableCell className="py-4">
          <div className="h-6 bg-muted rounded w-16" />
        </TableCell>
        <TableCell className="py-4">
          <div className="h-6 bg-muted rounded w-24" />
        </TableCell>
        <TableCell className="py-4">
          <div className="h-8 bg-muted rounded w-8 ml-auto" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

export function PermissionsTable() {
  usePerformance("PermissionsTable");

  const { data: permissionsData = [], isLoading, error, refetch } = usePermissions();

  const deletePermissionMutation = useDeletePermission();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  // تحويل البيانات من API إلى النوع المحلي
  const permissions = useMemo(() => {
    return permissionsData.map(transformPermissionFromAPI);
  }, [permissionsData]);

  // تهيئة الحالة من localStorage - بدون استخدام useLocalStorage المخصص
  const [sorting, setSorting] = useState<SortingState>(() => {
    try {
      const saved = localStorage.getItem(TABLE_STATE_KEY);
      return saved ? JSON.parse(saved).sorting : INITIAL_TABLE_STATE.sorting;
    } catch {
      return INITIAL_TABLE_STATE.sorting;
    }
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    try {
      const saved = localStorage.getItem(TABLE_STATE_KEY);
      return saved ? JSON.parse(saved).columnFilters : INITIAL_TABLE_STATE.columnFilters;
    } catch {
      return INITIAL_TABLE_STATE.columnFilters;
    }
  });

  const [globalFilter, setGlobalFilter] = useState(() => {
    try {
      const saved = localStorage.getItem(TABLE_STATE_KEY);
      return saved ? JSON.parse(saved).globalFilter : INITIAL_TABLE_STATE.globalFilter;
    } catch {
      return INITIAL_TABLE_STATE.globalFilter;
    }
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    try {
      const saved = localStorage.getItem(TABLE_STATE_KEY);
      return saved ? JSON.parse(saved).columnVisibility : INITIAL_TABLE_STATE.columnVisibility;
    } catch {
      return INITIAL_TABLE_STATE.columnVisibility;
    }
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
    try {
      const saved = localStorage.getItem(TABLE_STATE_KEY);
      return saved ? JSON.parse(saved).rowSelection : INITIAL_TABLE_STATE.rowSelection;
    } catch {
      return INITIAL_TABLE_STATE.rowSelection;
    }
  });

  // حفظ الحالة في localStorage - مرة واحدة فقط
  useEffect(() => {
    const stateToSave = {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    };
    localStorage.setItem(TABLE_STATE_KEY, JSON.stringify(stateToSave));
  }, [sorting, columnFilters, globalFilter, columnVisibility, rowSelection]);

  // إحصائيات البيانات
  const statistics = useMemo(() => {
    if (!permissions.length) return null;

    return {
      total: permissions.length,
      static: permissions.filter((p: { conditions: any }) => !p.conditions).length,
      dynamic: permissions.filter((p: { conditions: any }) => p.conditions).length,
      byResource: permissions.reduce(
        (acc, p) => {
          acc[p.resource] = (acc[p.resource] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byAction: permissions.reduce(
        (acc, p) => {
          acc[p.action] = (acc[p.action] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentlyAdded: permissions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };
  }, [permissions]);

  const uniqueResources = useMemo(() => {
    const resources = new Set(permissions.map((p) => p.resource));
    return Array.from(resources).map((resource) => ({
      value: resource,
      label: resource.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
  }, [permissions]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(permissions.map((p) => p.action));
    return Array.from(actions).map((action) => ({
      value: action,
      label: action.replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
  }, [permissions]);

  const handleDelete = useCallback(
    async (permissionId: string, permissionName: string) => {
      setDeletingId(permissionId);
      try {
        const result = await deletePermissionMutation.mutateAsync(permissionId);
        if (result.success) {
          toast.success(result.message);
          refetch();
        } else {
          toast.error("خطأ", { description: result.message });
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("حدث خطأ أثناء الحذف");
      } finally {
        setDeletingId(null);
      }
    },
    [deletePermissionMutation, refetch],
  );

  const handleBulkDelete = useCallback(
    async (permissionIds: string[]) => {
      try {
        const results = await Promise.all(
          permissionIds.map((id) => deletePermissionMutation.mutateAsync(id)),
        );
        const successCount = results.filter((r) => r.success).length;
        if (successCount === permissionIds.length) {
          toast.success(`تم حذف ${successCount} صلاحية بنجاح`);
        } else {
          toast.warning(`تم حذف ${successCount} من ${permissionIds.length} صلاحية`);
        }

        refetch();
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("حدث خطأ أثناء الحذف الجماعي");
      }
    },
    [deletePermissionMutation, refetch],
  );

  const handleReset = useCallback(() => {
    setIsResetting(true);
    setSorting(INITIAL_TABLE_STATE.sorting);
    setColumnFilters(INITIAL_TABLE_STATE.columnFilters);
    setGlobalFilter(INITIAL_TABLE_STATE.globalFilter);
    setColumnVisibility(INITIAL_TABLE_STATE.columnVisibility);
    setRowSelection(INITIAL_TABLE_STATE.rowSelection);
    localStorage.removeItem(TABLE_STATE_KEY);
    setTimeout(() => setIsResetting(false), 500);
  }, []);

  const columns = useMemo<ColumnDef<Permission>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px] border-primary"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px] border-primary"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-accent/50 transition-colors"
          >
            <span>Name</span>
            {column.getIsSorted() === "desc" ? " ▼" : column.getIsSorted() === "asc" ? " ▲" : ""}
          </Button>
        ),
        cell: ({ row }) => {
          const description = row.original.description;
          return (
            <div className="font-medium">
              <div className="flex flex-col space-y-1">
                <span className="font-semibold">{row.getValue("name")}</span>
                {description && (
                  <span
                    className="text-xs text-muted-foreground truncate max-w-[200px]"
                    title={description}
                  >
                    {description}
                  </span>
                )}
              </div>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "resource",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-accent/50 transition-colors"
          >
            <span>Resource</span>
            {column.getIsSorted() === "desc" ? " ▼" : column.getIsSorted() === "asc" ? " ▲" : ""}
          </Button>
        ),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="font-mono text-xs uppercase max-w-32 truncate"
            title={row.getValue("resource") as string}
          >
            {(row.getValue("resource") as string)?.replace(/_/g, " ")}
          </Badge>
        ),
        filterFn: (row, id, filterValues: string[]) => {
          const rowValue = row.getValue(id) as string;
          if (!filterValues || filterValues.length === 0) return true;
          return filterValues.includes(rowValue);
        },
        size: 120,
      },
      {
        accessorKey: "action",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-accent/50 transition-colors"
          >
            <span>Action</span>
            {column.getIsSorted() === "desc" ? " ▼" : column.getIsSorted() === "asc" ? " ▲" : ""}
          </Button>
        ),
        cell: ({ row }) => {
          const action = row.getValue("action") as string;
          return (
            <Badge variant={getActionBadgeVariant(action)} className="capitalize">
              {action}
            </Badge>
          );
        },
        filterFn: (row, id, filterValues: string[]) => {
          const rowValue = row.getValue(id) as string;
          if (!filterValues || filterValues.length === 0) return true;
          return filterValues.includes(rowValue);
        },
        size: 100,
      },
      {
        accessorKey: "conditions",
        header: "Type",
        cell: ({ row }) => {
          const isDynamic = !!row.original.conditions;
          return (
            <div className="flex items-center gap-2">
              {isDynamic ? (
                <Zap className="h-4 w-4 text-cyan-600" />
              ) : (
                <Shield className="h-4 w-4 text-muted-foreground" />
              )}
              <Badge
                variant={isDynamic ? "default" : "secondary"}
                className={cn(isDynamic && "bg-cyan-600 hover:bg-cyan-700 text-white")}
              >
                {isDynamic ? "Dynamic" : "Static"}
              </Badge>
            </div>
          );
        },
        filterFn: (row, _id, value) => {
          if (value === "all" || !value) return true;
          const hasConditions = !!row.original.conditions;
          return (value === "dynamic" && hasConditions) || (value === "static" && !hasConditions);
        },
        size: 100,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const permission = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-muted/50 transition-colors"
                  aria-label={`Open actions menu for ${permission.name}`}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(permission.id);
                    // toast.success('Copied permission ID');
                  }}
                  className="flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/permissions/${permission.id}/edit`}
                    className="flex items-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <AlertDialogDelete
                  itemName={permission.name}
                  itemType="الصلاحية"
                  onConfirm={() => handleDelete(permission.id, permission.name)}
                  isLoading={deletingId === permission.id}
                  trigger={
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 flex items-center"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 60,
      },
    ],
    [handleDelete, deletingId],
  );

  const table = useReactTable({
    data: permissions,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize: 15 } },
  });

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center text-red-600 dark:text-red-400">
            <div className="text-lg font-semibold mb-2">خطأ في تحميل الصلاحيات</div>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
              {error.message}
            </div>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Panel */}
      {statistics && (
        <StatisticsPanel
          statistics={statistics}
          isOpen={showStatistics}
          onToggle={() => setShowStatistics(!showStatistics)}
        />
      )}

      <Card className="overflow-hidden shadow-2xl border-0 dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-800 dark:to-cyan-800">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Key className="h-7 w-7" />
              Permissions List
              {statistics && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-white/20 text-white hover:bg-white/30"
                >
                  {statistics.total} Total
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-blue-100 dark:text-blue-200">
              Manage and configure system permissions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {statistics && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStatistics(!showStatistics)}
                className="text-white hover:bg-white/20"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showStatistics ? "Hide Stats" : "Show Stats"}
              </Button>
            )}
            <div className="rounded-full bg-white/20 p-2">
              <Key className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <PermissionsTableToolbar
            table={table}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            isResetting={isResetting}
            onReset={handleReset}
            data={permissions}
            resources={uniqueResources}
            actions={uniqueActions}
            onBulkDelete={handleBulkDelete}
          />

          <div className="rounded-lg border bg-gradient-to-br from-background to-muted/20 dark:to-muted/10 mt-4">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b-0 hover:bg-transparent bg-muted/50 dark:bg-muted/20"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-12 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider last:pr-6"
                        style={{
                          width: header.getSize() !== 150 ? header.getSize() : undefined,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton pageSize={table.getState().pagination.pageSize} />
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-b border-border/50 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm dark:hover:bg-muted/20"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-4"
                          style={{
                            width:
                              cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center py-8">
                        <Key className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <div className="text-lg font-semibold mb-2">No permissions found</div>
                        <div className="text-sm text-muted-foreground">
                          {globalFilter || columnFilters.length > 0
                            ? "Try adjusting your search or filters"
                            : "No permissions have been created yet"}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination and Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  Showing {table.getFilteredRowModel().rows.length} of {permissions.length} total
                  permissions
                </span>
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                  <Badge variant="secondary">
                    {table.getFilteredSelectedRowModel().rows.length} selected
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="h-9 w-[70px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                >
                  {[10, 15, 20, 30, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  {"<<"}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  {"<"}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  {">"}
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  {">>"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
