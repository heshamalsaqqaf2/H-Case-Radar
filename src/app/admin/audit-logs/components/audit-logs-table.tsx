/** biome-ignore-all lint/a11y/noLabelWithoutControl: <> */
"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/lib/authorization/hooks/admin/use-audit-logs";
import type { AuditLog } from "@/lib/database/schema";
import type { AuditLogFilters } from "../actions";
import { AuditLogDetailsDialog } from "./audit-log-details-dialog";

const DEFAULT_FILTERS: AuditLogFilters = {
  page: 1,
  perPage: 20,
};

export function AuditLogsTable() {
  const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_FILTERS);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isPending, error } = useAuditLogs(filters);

  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS, // ← نحافظ على القيم الافتراضية
      ...prev,
      ...newFilters,
      page: 1, // إعادة التصفح عند تغيير الفلاتر
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          فشل تحميل السجلات: {error.message}
        </CardContent>
      </Card>
    );
  }

  // ✅ الآن data تحتوي على: logs, total, page, perPage مباشرةً
  const logs = data?.logs || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const perPage = data?.perPage || 20;

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجلات النظام</CardTitle>
        <CardDescription>
          {total} سجل أمني. قم بتصفية النتائج حسب الحاجة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* فلاتر */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium">الكيان</label>
            <Input
              placeholder="user, role, ..."
              value={filters.entity || ""}
              onChange={(e) =>
                handleFilterChange({ entity: e.target.value || undefined })
              }
              disabled={isPending}
            />
          </div>
          <div>
            <label className="text-sm font-medium">الإجراء</label>
            <Input
              placeholder="create, update, ..."
              value={filters.action || ""}
              onChange={(e) =>
                handleFilterChange({ action: e.target.value || undefined })
              }
              disabled={isPending}
            />
          </div>
          <div>
            <label className="text-sm font-medium">من تاريخ</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isPending}
                >
                  {filters.startDate
                    ? format(new Date(filters.startDate), "PPP", { locale: ar })
                    : "اختر تاريخًا"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    filters.startDate ? new Date(filters.startDate) : undefined
                  }
                  onSelect={(date) =>
                    handleFilterChange({ startDate: date?.toISOString() })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-sm font-medium">إلى تاريخ</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isPending}
                >
                  {filters.endDate
                    ? format(new Date(filters.endDate), "PPP", { locale: ar })
                    : "اختر تاريخًا"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    filters.endDate ? new Date(filters.endDate) : undefined
                  }
                  onSelect={(date) =>
                    handleFilterChange({ endDate: date?.toISOString() })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* جدول السجلات */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>الإجراء</TableHead>
                <TableHead>الكيان</TableHead>
                <TableHead>التفاصيل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    لا توجد سجلات تطابق المعايير المحددة.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: AuditLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.userId === "anonymous" ? "مجهول" : log.userId}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.action}
                    </TableCell>
                    <TableCell className="capitalize">{log.entity}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        انقر للعرض
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.createdAt), "PPP p", { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        disabled={isPending}
                      >
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* تصفح الصفحات */}
        {total > perPage && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              عرض {(currentPage - 1) * perPage + 1}–
              {Math.min(currentPage * perPage, total)} من {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage * perPage >= total || isPending}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {selectedLog && (
        <AuditLogDetailsDialog
          log={selectedLog}
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
        />
      )}
    </Card>
  );
}
