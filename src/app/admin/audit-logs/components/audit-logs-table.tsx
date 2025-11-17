// src/components/ui/audit/audit-logs-table.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AlertTriangle, CheckCircle, Clock, Eye, Info, Shield, User, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLog } from "@/lib/database/schema";
import { AuditLogDetails } from "./audit-log-details";

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
}

const getSeverityVariant = (severity: string | null) => {
  switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    case "info":
      return "default";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: string | null) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "failure":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default:
      return <Info className="h-4 w-4 text-gray-600" />;
  }
};

const getActionColor = (action: string) => {
  if (action.includes("login")) return "blue";
  if (action.includes("create")) return "green";
  if (action.includes("update")) return "yellow";
  if (action.includes("delete")) return "red";
  if (action.includes("failed") || action.includes("unauthorized")) return "red";
  return "gray";
};

export function AuditLogsTable({ logs, isLoading }: AuditLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (isLoading) {
    return (
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>النشاط</TableHead>
              <TableHead>الكيان</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الخطورة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  }

  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Shield className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold">لا توجد سجلات</h3>
        <p className="text-sm">لم يتم العثور على سجلات تدقيق تطابق معايير البحث</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-[300px]">النشاط</TableHead>
              <TableHead>الكيان</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الخطورة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead className="w-20">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${getActionColor(log.action)}-500`} />
                    <span className="max-w-[280px] truncate" title={log.action}>
                      {log.action}
                    </span>
                  </div>
                  {log.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate" title={log.description}>
                      {log.description}
                    </p>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {log.entity}
                    </Badge>
                    {log.entityId && (
                      <span className="text-xs text-muted-foreground" title={log.entityId}>
                        #{log.entityId.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {log.userId === "anonymous" ? "مجهول" : log.userId?.slice(0, 8)}
                    </span>
                  </div>
                  {log.ipAddress && (
                    <span className="text-xs text-muted-foreground" title={log.ipAddress}>
                      {log.ipAddress}
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <Badge variant={log.status === "success" ? "default" : "secondary"} className="text-xs">
                      {log.status === "success"
                        ? "ناجح"
                        : log.status === "failure"
                          ? "فاشل"
                          : log.status === "warning"
                            ? "تحذير"
                            : "غير معروف"}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={getSeverityVariant(log.severity)} className="text-xs">
                    {log.severity === "critical"
                      ? "حرج"
                      : log.severity === "high"
                        ? "عالي"
                        : log.severity === "medium"
                          ? "متوسط"
                          : log.severity === "low"
                            ? "منخفض"
                            : "معلومات"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span title={format(new Date(log.createdAt), "PPPPpp", { locale: ar })}>
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm", { locale: ar })}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(log)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* تفاصيل السجل */}
      <AuditLogDetails log={selectedLog} isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
