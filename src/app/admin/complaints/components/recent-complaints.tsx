// app/admin/complaints/components/recent-complaints.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplaintsList } from "@/lib/complaints/hooks/use-complaints";
import type { ComplaintSummary } from "@/lib/complaints/types/type-complaints";

export function RecentComplaints() {
  // جلب أحدث 5 شكاوى فقط
  const { data: complaintsResult, isLoading } = useComplaintsList(
    "",
    undefined,
    undefined,
    undefined,
    undefined,
    5,
  );

  const complaints = complaintsResult?.success ? complaintsResult.data?.items : [];

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>أحدث الشكاوى</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد شكاوى حديثة</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/complaints/${complaint.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline truncate block"
                  >
                    {complaint.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">بواسطة {complaint.submittedByUserName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getPriorityBadge(complaint.priority)}
                  {getStatusBadge(complaint.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
