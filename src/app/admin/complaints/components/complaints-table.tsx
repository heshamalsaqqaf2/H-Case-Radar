// components/complaints/complaints-table.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ArrowUpDown,
  CheckCircle,
  Edit,
  Eye,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useCloseComplaint,
  useDeleteComplaint,
  useEscalateComplaint,
  useReopenComplaint,
  useResolveComplaint,
} from "@/lib/complaints/hooks/use-complaints";
import type { ComplaintSummary } from "@/lib/complaints/types/type-complaints";
import { cn } from "@/lib/utils";

interface ComplaintsTableProps {
  complaints: ComplaintSummary[];
  isLoading: boolean;
  error: unknown;
}

export function ComplaintsTable({ complaints, isLoading, error }: ComplaintsTableProps) {
  const [sortField, setSortField] = useState<keyof ComplaintSummary>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const deleteComplaintMutation = useDeleteComplaint();
  const resolveComplaintMutation = useResolveComplaint();
  const closeComplaintMutation = useCloseComplaint();
  const reopenComplaintMutation = useReopenComplaint();
  const escalateComplaintMutation = useEscalateComplaint();

  const handleSort = (field: keyof ComplaintSummary) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedComplaints = [...complaints].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status: ComplaintSummary["status"]) => {
    const statusConfig = {
      open: { label: "مفتوحة", variant: "default" as const },
      in_progress: { label: "قيد التنفيذ", variant: "secondary" as const },
      resolved: { label: "تم الحل", variant: "default" as const },
      closed: { label: "مغلقة", variant: "outline" as const },
      unresolved: { label: "لم تحل", variant: "destructive" as const },
      escalated: { label: "مُصعّدة", variant: "secondary" as const },
      on_hold: { label: "معلقة", variant: "outline" as const },
      reopened: { label: "أُعيد فتحها", variant: "secondary" as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: ComplaintSummary["priority"]) => {
    const priorityConfig = {
      low: { label: "منخفضة", variant: "outline" as const },
      medium: { label: "متوسطة", variant: "secondary" as const },
      high: { label: "عالية", variant: "default" as const },
      critical: { label: "حرجة", variant: "destructive" as const },
    };

    const config = priorityConfig[priority];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ: {error instanceof Error ? error.message : "خطأ غير معروف"}</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("title")}
                className="h-auto p-0 font-semibold"
              >
                العنوان
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>الفئة</TableHead>
            <TableHead>المُعيّن إليه</TableHead>
            <TableHead>المُقدم</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("createdAt")}
                className="h-auto p-0 font-semibold"
              >
                تاريخ الإنشاء
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>آخر نشاط</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedComplaints.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                لا توجد شكاوى
              </TableCell>
            </TableRow>
          ) : (
            sortedComplaints.map((complaint) => (
              <TableRow
                key={complaint.id}
                className={cn(complaint.isUrgent && "bg-red-50 dark:bg-red-950/20")}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {complaint.isUrgent && <div className="h-2 w-2 rounded-full bg-red-500" title="عاجلة" />}
                    <Link href={`/admin/complaints/${complaint.id}`} className="hover:underline">
                      {complaint.title}
                    </Link>
                    {complaint.hasAttachments && (
                      <div
                        className="h-4 w-4 rounded bg-blue-100 text-blue-600 text-xs flex items-center justify-center"
                        title="يوجد مرفقات"
                      >
                        📎
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                <TableCell>{complaint.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="" alt={complaint.assignedUserName} />
                      <AvatarFallback className="text-xs">
                        {complaint.assignedUserName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[100px]">{complaint.assignedUserName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="" alt={complaint.submittedByUserName} />
                      <AvatarFallback className="text-xs">
                        {complaint.submittedByUserName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[100px]">{complaint.submittedByUserName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(complaint.createdAt), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(complaint.lastActivityAt), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/complaints/${complaint.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          عرض التفاصيل
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/complaints/${complaint.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          تعديل
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {complaint.status !== "resolved" && (
                        <DropdownMenuItem
                          onClick={() => resolveComplaintMutation.mutate({ complaintId: complaint.id })}
                          disabled={resolveComplaintMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          حل الشكوى
                        </DropdownMenuItem>
                      )}
                      {complaint.status !== "closed" && (
                        <DropdownMenuItem
                          onClick={() => closeComplaintMutation.mutate({ complaintId: complaint.id })}
                          disabled={closeComplaintMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          إغلاق الشكوى
                        </DropdownMenuItem>
                      )}
                      {(complaint.status === "closed" || complaint.status === "resolved") && (
                        <DropdownMenuItem
                          onClick={() =>
                            reopenComplaintMutation.mutate({
                              complaintId: complaint.id,
                              reason: "إعادة فتح من القائمة",
                            })
                          }
                          disabled={reopenComplaintMutation.isPending}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          إعادة فتح
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() =>
                          escalateComplaintMutation.mutate({ complaintId: complaint.id, level: "level_1" })
                        }
                        disabled={escalateComplaintMutation.isPending}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        تصعيد
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteComplaintMutation.mutate({ id: complaint.id })}
                        disabled={deleteComplaintMutation.isPending}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
