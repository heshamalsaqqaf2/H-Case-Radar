/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { Edit, Eye, Filter, MoreHorizontal, Search, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useComplaintsList } from "@/lib/complaints/hooks/use-complaints";
import type { ComplaintSummary } from "@/lib/complaints/types/type-complaints";
import { ComplaintStatusBadge } from "./complaint-status-badge";
import { PriorityBadge } from "./priority-badge";

interface ComplaintsTableProps {
  onViewComplaint: (id: string) => void;
  onEditComplaint?: (id: string) => void;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 flex-1" />
        </div>
      ))}
    </div>
  );
}

export function ComplaintsTable({ onViewComplaint, onEditComplaint }: ComplaintsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const { data: complaintsResult, isLoading } = useComplaintsList(
    search || undefined,
    statusFilter || undefined,
    priorityFilter || undefined,
  );

  const complaints = complaintsResult?.success ? complaintsResult.data.items : [];
  //   const complaints = complaintsResult?.success ? complaintsResult.data?.items || [] : [];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في الشكاوى..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              الفلاتر
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>تصفية حسب الحالة</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter("")}>جميع الحالات</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("open")}>مفتوحة</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>قيد التنفيذ</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>تم الحل</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الشكوى</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الأولوية</TableHead>
              <TableHead>المسند إلى</TableHead>
              <TableHead>آخر نشاط</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <TableSkeleton />
                </TableCell>
              </TableRow>
            ) : complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا توجد شكاوى
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((complaint: ComplaintSummary) => (
                <TableRow key={complaint.id} className="group">
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium line-clamp-1">{complaint.title}</div>
                      <div className="text-sm text-muted-foreground">{complaint.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ComplaintStatusBadge status={complaint.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={complaint.priority} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{complaint.assignedUserName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(complaint.lastActivityAt).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewComplaint(complaint.id)}>
                          <Eye className="h-4 w-4 ml-2" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        {onEditComplaint && (
                          <DropdownMenuItem onClick={() => onEditComplaint(complaint.id)}>
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
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
      </div>
    </div>
  );
}
