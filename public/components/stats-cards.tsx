/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplaintStats } from "@/lib/complaints/hooks/use-complaints";

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-32 mt-2" />
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { data: statsResult, isLoading, error } = useComplaintStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !statsResult?.success) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">فشل في تحميل الإحصائيات</div>
        </CardContent>
      </Card>
    );
  }

  const stats = statsResult.data;

  const statCards = [
    {
      title: "إجمالي الشكاوى",
      value: stats.total,
      description: "جميع الشكاوى",
      icon: FileText,
      trend: stats.total > 0 ? "+0%" : "0%",
    },
    {
      title: "قيد التنفيذ",
      value: stats.inProgress,
      description: "قيد المعالجة",
      icon: Clock,
      trend: `${Math.round((stats.inProgress / stats.total) * 100)}%`,
    },
    {
      title: "تم الحل",
      value: stats.resolved,
      description: "شكاوى مغلقة",
      icon: CheckCircle,
      trend: `${Math.round((stats.resolved / stats.total) * 100)}%`,
    },
    {
      title: "عالية الأولوية",
      value: stats.highPriority,
      description: "تحتاج متابعة",
      icon: AlertTriangle,
      trend: `${Math.round((stats.highPriority / stats.total) * 100)}%`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardDescription className="text-xs font-medium">{stat.trend}</CardDescription>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
