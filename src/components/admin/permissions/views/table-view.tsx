// src/components/admin/permissions/views/table-view.tsx

import {
  type Cell,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Header,
  type RowModel,
  type TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
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
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/permission";
import { PermissionsTableToolbar } from "../table/permissions-table-toolbar";

interface TableViewProps {
  permissions: Permission[];
  table: TableOptions<Permission>;
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
  isResetting: boolean;
  onReset: () => void;
  resources: { value: string; label: string }[];
  actions: { value: string; label: string }[];
}

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

export function TableView({
  permissions,
  table,
  onDelete,
  deletingId,
  isResetting,
  onReset,
  resources,
  actions,
}: TableViewProps) {
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
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-12 px-4 text-left font-semibold"
          >
            Name
            {column.getIsSorted() === "desc"
              ? " ▼"
              : column.getIsSorted() === "asc"
                ? " ▲"
                : ""}
          </Button>
        ),
      },
      {
        accessorKey: "resource",
        header: "Resource",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs uppercase">
            {row.getValue("resource")?.toString().replace(/_/g, " ")}
          </Badge>
        ),
        filterFn: (row, id, filterValues: string[]) => {
          const rowValue = row.getValue(id) as string;
          if (filterValues.length === 0) return true;
          return filterValues.includes(rowValue);
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "capitalize",
              getActionBadgeVariant(row.getValue("action") as string),
            )}
          >
            {row.getValue("action")}
          </Badge>
        ),
        filterFn: (row, id, filterValues: string[]) => {
          const rowValue = row.getValue(id) as string;
          if (filterValues.length === 0) return true;
          return filterValues.includes(rowValue);
        },
      },
      {
        accessorKey: "conditions",
        header: "Type",
        cell: ({ row }) =>
          row.original.conditions ? (
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
              Dynamic
            </Badge>
          ) : (
            <Badge variant="secondary">Static</Badge>
          ),
        filterFn: (row, _id, value) => {
          if (value === "all") return true;
          const hasConditions = !!row.original.conditions;
          return (
            (value === "dynamic" && hasConditions) ||
            (value === "static" && !hasConditions)
          );
        },
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
                  className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <ProtectedComponent permission="permission.edit">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/permissions/${permission.id}/edit`}
                      className="flex items-center"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                </ProtectedComponent>
                <ProtectedComponent permission="permission.delete">
                  <AlertDialogDelete
                    itemName={permission.name}
                    itemType="الصلاحية"
                    onConfirm={async () =>
                      onDelete(permission.id, permission.name)
                    }
                    isLoading={deletingId === permission.id}
                    trigger={
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    }
                  />
                </ProtectedComponent>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onDelete, deletingId],
  );

  const tableInstance = useReactTable({
    data: permissions,
    columns,
    state: table.getState(),
    onSortingChange: table.setSorting,
    onColumnFiltersChange: table.setColumnFilters,
    onGlobalFilterChange: table.setGlobalFilter,
    onColumnVisibilityChange: table.setColumnVisibility,
    onRowSelectionChange: table.setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: table.getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <PermissionsTableToolbar
        table={tableInstance}
        isResetting={isResetting}
        onReset={onReset}
        resources={resources}
        actions={actions}
      />
      <div className="rounded-lg border bg-background shadow-sm">
        <Table>
          <TableHeader>
            {tableInstance.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b-0 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-b bg-muted/50 sticky top-0 z-10"
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header
                        ? header.column.columnDef.header({
                            column: header.column,
                          })
                        : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tableInstance.getRowModel().rows?.length ? (
              tableInstance.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-muted/50 [&:has([role=checkbox])]:pr-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {tableInstance.getPageCount() > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {tableInstance.getFilteredSelectedRowModel().rows.length} of{" "}
            {tableInstance.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={tableInstance.getState().pagination.pageSize}
                onChange={(e) =>
                  tableInstance.setPageSize(Number(e.target.value))
                }
                className="h-9 w-[70px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {[10, 15, 20, 30, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {tableInstance.getState().pagination.pageIndex + 1} of{" "}
              {tableInstance.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => tableInstance.setPageIndex(0)}
                disabled={!tableInstance.getCanPreviousPage()}
              >
                {"<<"}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => tableInstance.previousPage()}
                disabled={!tableInstance.getCanPreviousPage()}
              >
                {"<"}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => tableInstance.nextPage()}
                disabled={!tableInstance.getCanNextPage()}
              >
                {">"}
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() =>
                  tableInstance.setPageIndex(tableInstance.getPageCount() - 1)
                }
                disabled={!tableInstance.getCanNextPage()}
              >
                {">>"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
