// components/complaints/complaint-stats-cards.tsx
"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  RotateCcw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplaintStats } from "@/lib/complaints/types/type-complaints";

interface ComplaintStatsCardsProps {
  stats: ComplaintStats;
}

export function ComplaintStatsCards({ stats }: ComplaintStatsCardsProps) {
  const statCards = [
    {
      title: "إجمالي الشكاوى",
      value: stats.total,
      icon: FileText,
      description: "جميع الشكاوى في النظام",
    },
    {
      title: "مفتوحة",
      value: stats.open,
      icon: Clock,
      description: "شكاوى تحتاج إلى معالجة",
      variant: "default" as const,
    },
    {
      title: "قيد التنفيذ",
      value: stats.inProgress,
      icon: AlertCircle,
      description: "شكاوى قيد المعالجة",
      variant: "secondary" as const,
    },
    {
      title: "تم حلها",
      value: stats.resolved,
      icon: CheckCircle,
      description: "شكاوى تم حلها بنجاح",
      variant: "default" as const,
    },
    {
      title: "مغلقة",
      value: stats.closed,
      icon: XCircle,
      description: "شكاوى تم إغلاقها",
      variant: "outline" as const,
    },
    {
      title: "لم تحل",
      value: stats.unresolved,
      icon: XCircle,
      description: "شكاوى تم إغلاقها دون حل",
      variant: "destructive" as const,
    },
    {
      title: "مُصعّدة",
      value: stats.escalated,
      icon: TrendingUp,
      description: "شكاوى تم تصعيدها",
      variant: "secondary" as const,
    },
    {
      title: "معلقة",
      value: stats.onHold,
      icon: AlertTriangle,
      description: "شكاوى معلقة مؤقتاً",
      variant: "outline" as const,
    },
    {
      title: "أُعيد فتحها",
      value: stats.reopened,
      icon: RotateCcw,
      description: "شكاوى تمت إعادة فتحها",
      variant: "secondary" as const,
    },
    {
      title: "عاجلة",
      value: stats.urgent,
      icon: AlertTriangle,
      description: "شكاوى عاجلة تحتاج إلى اهتمام فوري",
      variant: "destructive" as const,
    },
    {
      title: "ذات أولوية عالية",
      value: stats.highPriority,
      icon: AlertCircle,
      description: "شكاوى ذات أولوية عالية",
      variant: "destructive" as const,
    },
    {
      title: "متأخرة",
      value: stats.overdue,
      icon: Clock,
      description: "شكاوى تجاوزت موعد الحل",
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
              {card.variant && (
                <Badge variant={card.variant} className="absolute bottom-2 right-2 text-xs">
                  {card.value > 0 ? "يتطلب انتباه" : "لا يوجد"}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
