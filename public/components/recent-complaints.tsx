/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplaintsList } from "@/lib/complaints/hooks/use-complaints";
import { ComplaintStatusBadge } from "./complaint-status-badge";
import { PriorityBadge } from "./priority-badge";

function RecentComplaintsSkeleton() {
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

export function RecentComplaints() {
  const router = useRouter();
  const { data: complaintsResult, isLoading } = useComplaintsList(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    10,
  );

  const complaints = complaintsResult?.success ? complaintsResult.data.items : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>آخر الشكاوى</CardTitle>
          <CardDescription>أحدث الشكاوى المضافة إلى النظام</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div onClick={() => router.push("/admin/complaints")}>
            عرض الكل
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <RecentComplaintsSkeleton />
        ) : complaints.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">لا توجد شكاوى</div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
              <div
                key={complaint.id}
                className="flex items-center justify-between hover:bg-muted/50 p-3 rounded-lg cursor-pointer transition-colors"
                onClick={() => router.push(`/admin/complaints/${complaint.id}`)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium leading-none line-clamp-1">{complaint.title}</p>
                      <ComplaintStatusBadge status={complaint.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{complaint.assignedUserName}</span>
                      <span>•</span>
                      <span>{complaint.category}</span>
                      <span>•</span>
                      <span>{format(complaint.createdAt, "dd/MM/yyyy", { locale: ar })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
