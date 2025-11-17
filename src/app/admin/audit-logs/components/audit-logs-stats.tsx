// src/app/admin/audit-logs/components/audit-logs-stats.tsx
"use client";

import { Activity, AlertTriangle, CheckCircle, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogStats } from "@/lib/authorization/hooks/admin/use-audit-logs";

export function AuditLogsStats() {
  const { data: stats, isLoading, error } = useAuditLogStats();

  if (error) {
    console.error("Error loading stats:", error);
    return null;
  }

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color = "blue",
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    color?: "blue" | "green" | "red" | "yellow";
  }) => {
    const colorClasses = {
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      green: "text-green-600 bg-green-50 border-green-200",
      red: "text-red-600 bg-red-50 border-red-200",
      yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    };

    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold">{value}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="إجمالي السجلات"
        value={stats?.total?.toLocaleString() || "0"}
        description="جميع سجلات النظام"
        icon={Shield}
        color="blue"
      />

      <StatCard
        title="سجلات اليوم"
        value={stats?.todayCount?.toLocaleString() || "0"}
        description="النشاط اليومي"
        icon={Activity}
        color="green"
      />

      <StatCard
        title="عمليات ناجحة"
        value={stats?.byStatus?.success?.toLocaleString() || "0"}
        description="عمليات مكتملة"
        icon={CheckCircle}
        color="green"
      />

      <StatCard
        title="مشاكل أمنية"
        value={(stats?.bySeverity?.high || 0) + (stats?.bySeverity?.critical || 0)}
        description="تحتاج مراجعة"
        icon={AlertTriangle}
        color="red"
      />
    </div>
  );
}
