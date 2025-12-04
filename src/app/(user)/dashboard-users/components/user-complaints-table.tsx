// components/complaints/complaints-table.tsx
"use client";

import {
  IconAlertCircle,
  IconCalendarPause,
  IconFile3d,
  IconProgress,
  IconSearch,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ArrowUpDown,
  CheckCircle,
  ClockFadingIcon,
  Eye,
  LockOpen,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataError } from "@/components/dashboard/errors/data-error";
import { EmotionalLoading } from "@/components/shared/loading-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCloseComplaint, useResolveComplaint } from "@/lib/complaints/hooks/use-complaints";
import type { ComplaintSummary } from "@/lib/complaints/types/type-complaints";
import { cn } from "@/lib/utils";

interface ComplaintsTableProps {
  complaints: ComplaintSummary[];
  isLoading: boolean;
  error: unknown;
}

export function UserComplaintsTable({ complaints, isLoading, error }: ComplaintsTableProps) {
  const [sortField, setSortField] = useState<keyof ComplaintSummary>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const resolveComplaintMutation = useResolveComplaint();
  const closeComplaintMutation = useCloseComplaint();

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

    if (aValue! < bValue!) return sortDirection === "asc" ? -1 : 1;
    if (aValue! > bValue!) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  const getStatusBadge = (status: ComplaintSummary["status"]) => {
    const statusConfig = {
      open: {
        label: "مفتوحة",
        icon: <LockOpen className="w-4 h-4 mr-2" />,
        className: "bg-primary text-primary-foreground" as const,
      },
      in_progress: {
        label: "قيد التنفيذ",
        icon: <IconProgress className="w-4 h-4 mr-2" />,
        className: "bg-amber-500 text-amber-50" as const,
      },
      resolved: {
        label: "تم الحل",
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
        className: "bg-emerald-500 text-emerald-50" as const,
      },
      closed: {
        label: "مغلقة",
        icon: <ClockFadingIcon className="w-4 h-4 mr-2" />,
        className: "bg-gray-500 text-gray-50" as const,
      },
      unresolved: {
        label: "لم تحل",
        icon: <XCircle className="w-4 h-4 mr-2" />,
        className: "bg-red-500 text-red-50" as const,
      },
      escalated: {
        label: "مصعدة",
        icon: <IconAlertCircle className="w-4 h-4 mr-2" />,
        className: "bg-blue-500 text-blue-50" as const,
      },
      on_hold: {
        label: "معلقة",
        icon: <IconCalendarPause className="w-4 h-4 mr-2" />,
        className: "bg-yellow-500 text-yellow-50" as const,
      },
      reopened: {
        label: "أُعيد فتحها",
        icon: <ClockFadingIcon className="w-4 h-4 mr-2" />,
        className: "bg-green-500 text-green-50" as const,
      },
    };

    const config = statusConfig[status];
    return (
      <Badge
        variant="outline"
        className={`
        ${status === "open" ? "border-primary/50 text-primary-foreground bg-primary/10" : ""}
        ${status === "in_progress" ? "border-amber-500/50 text-amber-400 bg-amber-500/10" : ""}
        ${status === "resolved" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : ""}
        ${status === "closed" ? "border-gray-500/50 text-gray-400 bg-gray-500/10" : ""}
        ${status === "unresolved" ? "border-red-500/50 text-red-400 bg-red-500/10" : ""}
        ${status === "escalated" ? "border-blue-500/50 text-blue-400 bg-blue-500/10" : ""}
        ${status === "on_hold" ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" : ""}
        ${status === "reopened" ? "border-green-500/50 text-green-400 bg-green-500/10" : ""}
        border backdrop-blur-sm px-2 py-0.5
      `}
      >
        {config.label}
        {config.icon}
      </Badge>
    );
  };
  const getPriorityBadge = (priority: ComplaintSummary["priority"]) => {
    const priorityConfig = {
      low: { label: "L", className: "bg-emerald-500 text-emerald-50" as const },
      medium: { label: "M", className: "bg-yellow-500 text-yellow-50" as const },
      high: { label: "H", className: "bg-rose-500 text-rose-50" as const },
      critical: { label: "C", className: "bg-red-500 text-red-50" as const },
    };
    const config = priorityConfig[priority];
    return (
      <Badge
        variant="outline"
        className={`
                      ${priority === "low" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : ""}
                      ${priority === "medium" ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" : ""}
                      ${priority === "high" ? "border-rose-500/50 text-rose-400 bg-rose-500/10" : ""}
                      ${priority === "critical" ? "border-red-500/50 text-red-400 bg-red-500/10" : ""}
                      border backdrop-blur-sm
                    `}
      >
        {config.label}
      </Badge>
    );
  };

  if (isLoading) return <EmotionalLoading message="جاري تحميل بيانات البلاغات المسندة اليك" />;

  if (error)
    return (
      <DataError
        type="error"
        title="حدث خطأ"
        description="حدث خطأ أثناء تحميل بيانات البلاغات المسندة اليك"
        className="w-full h-full flex items-center justify-center"
      />
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <div className="flex flex-col gap-2">
          <CardTitle className="font-semibold text-lg drop-shadow-[0_0_8px_rgba(54,231,178,0.4)]">
            البلاغــــات المسنــــدة اليــك
            <span className="truncate max-w-[100px]">{ }</span>
          </CardTitle>
          <CardDescription>هذه قائمة البلاغات التي تم تعيينها لك من قبل المشرف</CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="بحث"
              className="w-[150px] rounded-md bg-[#111c2a] pr-8 h-9 text-xs outline-none focus:ring-1 focus:ring-primary border border-primary/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Select defaultValue="sort">
            <SelectTrigger className="w-[100px] h-9 text-xs bg-primary border-none font-bold">
              <SelectValue placeholder="ترتيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sort">ترتيب</SelectItem>
              <SelectItem value="newest">الاحدث</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
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
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("status")}
                  className="h-auto p-0 font-semibold"
                >
                  الحالة
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("priority")}
                  className="h-auto p-0 font-semibold"
                >
                  الأولوية
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {/* <TableHead>ضابط الاتصال</TableHead> */}
              <TableHead>منشئ البلاغ</TableHead>
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
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  لا توجد بلاغات
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
                      {complaint.isUrgent && (
                        <div
                          className="h-2 w-2 rounded-full animate-pulse dark:bg-red-400 bg-red-500"
                          title="بلاغ عاجل"
                        />
                      )}
                      <Link href={`/complaints/${complaint.id}`} className="hover:underline">
                        {complaint.title}
                      </Link>
                      {complaint.hasAttachments && (
                        <div
                          className="h-4 w-4 rounded bg-blue-100 text-blue-600 text-xs flex items-center justify-center"
                          title="يوجد مرفقات"
                        >
                          <IconFile3d />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell>{complaint.category}</TableCell>
                  <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                  {/* <TableCell>
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
                  </TableCell> */}
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
                      <span className="truncate max-w-[100px]">
                        {complaint.submittedByUserName}
                      </span>
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
                          <Link href={`/complaints/${complaint.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            عرض التفاصيل
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {complaint.status !== "resolved" && (
                          <DropdownMenuItem
                            onClick={() =>
                              resolveComplaintMutation.mutate({ complaintId: complaint.id })
                            }
                            disabled={resolveComplaintMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            حل الشكوى
                          </DropdownMenuItem>
                        )}
                        {complaint.status !== "closed" && (
                          <DropdownMenuItem
                            onClick={() =>
                              closeComplaintMutation.mutate({ complaintId: complaint.id })
                            }
                            disabled={closeComplaintMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            إغلاق الشكوى
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
