/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { IconDotsVertical } from "@tabler/icons-react";
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
import {
  ArrowDown,
  ArrowUp,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Key,
  Shield,
  Trash2,
  Zap,
} from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePerformance } from "@/hooks/data-table/use-performance";
import { useDeletePermission, usePermissions } from "@/lib/authorization/hooks/admin/use-permissions";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/tanstack-table-types/permission";
import { transformPermissionFromAPI } from "@/types/tanstack-table-types/permission";
import { CreatePermissionForm } from "./create-permission-form";
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
const TableSkeleton = ({ pageSize = 10 }: { pageSize?: number }) => (
  <>
    {Array.from({ length: pageSize }).map((_, index) => (
      <TableRow key={`skeleton-${index}`} className="border-b border-border/50 animate-pulse">
        <TableCell className="py-3">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="h-4 bg-muted rounded w-4 border border-border" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div className="h-6 bg-muted rounded w-38" />
        </TableCell>
        <TableCell className="py-3">
          <div className="h-6 bg-muted rounded w-32" />
        </TableCell>
        <TableCell className="py-3">
          <div className="h-6 bg-muted rounded w-24" />
        </TableCell>
        <TableCell className="py-3">
          <div className="h-8 bg-muted rounded w-16 ms-auto" /> {/* استخدم ms-auto لدفع العنصر لليسار */}
        </TableCell>
      </TableRow>
    ))}
  </>
);

export function PermissionsTable() {
  usePerformance("PermissionsTable");

  const { data: permissionsData, isLoading, error, refetch } = usePermissions();

  const deletePermissionMutation = useDeletePermission();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // تحويل البيانات من API إلى النوع المحلي
  const permissions = useMemo(() => {
    if (permissionsData?.success && permissionsData.data) {
      return permissionsData.data.map(transformPermissionFromAPI);
    }
    return [];
  }, [permissionsData]);

  // تهيئة الحالة من localStorage
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

  // حفظ الحالة في localStorage
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
      static: permissions.filter((p) => !p.conditions).length,
      dynamic: permissions.filter((p) => p.conditions).length,
      byResource: permissions.reduce(
        (acc: { [x: string]: number }, p) => {
          acc[p.resource] = (acc[p.resource] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byAction: permissions.reduce(
        (acc: { [x: string]: number }, p) => {
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
    async (permissionId: string) => {
      setDeletingId(permissionId);
      try {
        const result = await deletePermissionMutation.mutateAsync(permissionId);
        if (result.success) {
          toast.success(result.data?.message || "تم حذف الصلاحية بنجاح");
          refetch();
        } else {
          toast.error("خطأ", { description: result.error?.message });
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
              table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px] border-primary mr-4"
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px] border-primary mr-4"
            />
          </div>
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
            className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-accent/50 transition-colors" // استخدام me- بدلا من ml-
          >
            <span>الاسم</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              ""
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const description = row.original.description;
          return (
            <div className="font-medium">
              <div className="flex flex-col space-y-1">
                <span className="font-semibold">{row.getValue("name")}</span>
                {description && (
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]" title={description}>
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
            <span>المصدر</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              ""
            )}
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
            variant="outline"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-me-3 h-8 data-[state=open]:bg-accent hover:bg-accent/50 transition-colors"
          >
            <span>الإجراء</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-2 w-2" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-2 w-2" />
            ) : (
              ""
            )}
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
        header: "النوع",
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
                title={isDynamic ? "صلاحية ديناميكية" : "صلاحية ثابتة"}
                className={cn(
                  isDynamic
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white pointer-events-none",
                )}
              >
                {isDynamic ? "ديناميكي" : "ثابت"}
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
        header: "الإجراءت",
        enableHiding: false,
        cell: ({ row }) => {
          const permission = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                  size="icon"
                  aria-label={`Open actions menu for ${permission.name}`}
                >
                  <IconDotsVertical />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {/* <DropdownMenuLabel>الإجراءات</DropdownMenuLabel> */}
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(permission.id);
                  }}
                >
                  <Copy className="ml-1 h-4 w-4" />
                  نسخ المعرف
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin/permissions/${permission.id}/edit`}>
                    <Edit className="ml-1 h-4 w-4" />
                    تعديل
                  </Link>
                </DropdownMenuItem>
                <AlertDialogDelete
                  itemName={permission.name}
                  itemType="الصلاحية"
                  onConfirm={() => handleDelete(permission.id)}
                  isLoading={deletingId === permission.id}
                  trigger={
                    <DropdownMenuItem
                      variant="destructive"
                      className="flex items-center"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="ml-1 h-4 w-4" />
                      حذف
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
    initialState: { pagination: { pageSize: 10 } },
  });

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="">
          <div className="flex flex-col items-center justify-center text-center text-red-600 dark:text-red-400">
            <div className="text-lg font-semibold mb-2">خطأ في تحميل الصلاحيات</div>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">{error.message}</div>
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
      {statistics && (
        <StatisticsPanel
          statistics={statistics}
        // isOpen={showStatistics}
        // onToggle={() => setShowStatistics(!showStatistics)}
        />
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Key className="h-6 w-6" />
                الصلاحيات
                {statistics && (
                  <Badge variant="secondary" className="mr-2">
                    {statistics.total} إجمالي
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>إدارة صلاحيات النظام والتحكم بالوصول بشكل احترافي ومنظم.</CardDescription>
            </div>
            <div className="flex items-center gap-3">{statistics && <CreatePermissionForm />}</div>
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

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="px-4 text-right"
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
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 text-right"
                          style={{
                            width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      لا توجد صلاحيات.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">

            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <p className="text-sm font-medium">صفوف لكل صفحة</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 15, 20, 25, 30, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-fit items-center justify-center text-sm font-medium">
                صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronFirst className="h-4 w-4" />
                  <span className="sr-only">الذهاب إلى الصفحة الأولى</span>
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">الصفحة السابقة</span>
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">الصفحة التالية</span>
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronLast className="h-4 w-4" />
                  <span className="sr-only">الذهاب إلى الصفحة الأخيرة</span>
                </Button>
              </div>
            </div>

            <div className="text-muted-foreground hidden text-sm lg:flex">
              عرض {table.getFilteredRowModel().rows.length} من {permissions.length} صلاحية
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <span className="mr-2">({table.getFilteredSelectedRowModel().rows.length} محدد)</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
