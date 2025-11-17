// src/app/admin/audit-logs/components/audit-logs-dashboard.tsx
"use client";

import { Download, RefreshCw, Shield } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSmartAuditLogs } from "@/lib/authorization/hooks/admin/use-audit-logs";
import type { AuditLogFilters } from "@/lib/authorization/types/audit-log";
import { AuditLogsFilters } from "./audit-logs-filters";
import { AuditLogsStats } from "./audit-logs-stats";
import { AuditLogsTable } from "./audit-logs-table";

export function AuditLogsDashboard() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    perPage: 20,
    filterMode: "hybrid",
  });

  const { logs, total, totalPages, isLoading, error, filterMode } = useSmartAuditLogs(filters);

  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    setFilters((prev) => ({ ...prev }));
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting data...");
  };

  if (error) {
    return (
      <Card className="w-full border-destructive/50">
        <CardContent className="p-8 text-center">
          <div className="text-destructive">
            <Shield className="mx-auto h-16 w-16 mb-4 opacity-60" />
            <h3 className="text-xl font-semibold mb-2">فشل في تحميل السجلات</h3>
            <p className="text-sm mb-4">{error.message}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 space-x-6">
      {/* العنوان والإحصائيات */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            سجلات التدقيق الأمني
          </h1>
          <p className="text-muted-foreground mt-2">مراقبة وتحليل جميع الأنشطة والعمليات في النظام</p>
        </div>
        <AuditLogsStats />
      </div>

      {/* البطاقة الرئيسية */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">سجلات النشاط</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <span>عرض {total.toLocaleString()} سجل</span>
                <Badge variant={filterMode === "client" ? "secondary" : "default"} className="text-xs">
                  {filterMode === "client" ? "🔍 فلترة محلية" : "☁️ فلترة من الخادم"}
                </Badge>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                تحديث
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* الفلترة */}
          <div className="p-6 border-b">
            <AuditLogsFilters filters={filters} onFiltersChange={handleFilterChange} isLoading={isLoading} />
          </div>

          {/* الجدول */}
          <div className="p-0">
            <AuditLogsTable logs={logs} isLoading={isLoading} />
            {/* <AuditLogsTable logs={logs} isLoading={isLoading} totalItems={total} /> */}
          </div>

          {/* التقسيم للصفحات */}
          {totalPages > 1 && (
            <div className="border-t p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  الصفحة {filters.page} من {totalPages} • {total.toLocaleString()} سجل
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(filters.page - 1)}
                        className={filters.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber = i + 1;

                      if (totalPages > 5) {
                        if (filters.page > 3) {
                          pageNumber = filters.page - 2 + i;
                        }
                        if (filters.page > totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        }
                      }

                      if (pageNumber > totalPages || pageNumber < 1) return null;

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={filters.page === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(filters.page + 1)}
                        className={
                          filters.page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
