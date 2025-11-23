// components/complaints/complaint-timeline.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle, Clock, FileText, RotateCcw, TrendingUp, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ComplaintProfileData } from "@/lib/complaints/types/type-complaints";
import { cn } from "@/lib/utils";

interface ComplaintTimelineProps {
  timeline: ComplaintProfileData["timeline"];
}

/**
 * مكون الخط الزمني للشكوى
 * يعرض جميع التغييرات التي طرأت على الشكوى بترتيب زمني
 */
export function ComplaintTimeline({ timeline }: ComplaintTimelineProps) {
  /**
   * الحصول على إعدادات عرض الحالة (اللون، النص، الأيقونة)
   */
  const getStatusConfig = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "outline" | "destructive";
        icon: React.ComponentType<{ className?: string }>;
        bgColor: string;
        textColor: string;
      }
    > = {
      open: {
        label: "مفتوحة",
        variant: "default",
        icon: FileText,
        bgColor: "bg-blue-500",
        textColor: "text-white",
      },
      in_progress: {
        label: "قيد التنفيذ",
        variant: "secondary",
        icon: Clock,
        bgColor: "bg-orange-500",
        textColor: "text-white",
      },
      resolved: {
        label: "تم الحل",
        variant: "default",
        icon: CheckCircle,
        bgColor: "bg-green-500",
        textColor: "text-white",
      },
      closed: {
        label: "مغلقة",
        variant: "outline",
        icon: XCircle,
        bgColor: "bg-gray-500",
        textColor: "text-white",
      },
      unresolved: {
        label: "لم تحل",
        variant: "destructive",
        icon: XCircle,
        bgColor: "bg-red-500",
        textColor: "text-white",
      },
      escalated: {
        label: "مُصعّدة",
        variant: "secondary",
        icon: TrendingUp,
        bgColor: "bg-purple-500",
        textColor: "text-white",
      },
      on_hold: {
        label: "معلقة",
        variant: "outline",
        icon: Clock,
        bgColor: "bg-yellow-500",
        textColor: "text-white",
      },
      reopened: {
        label: "أُعيد فتحها",
        variant: "secondary",
        icon: RotateCcw,
        bgColor: "bg-indigo-500",
        textColor: "text-white",
      },
    };

    return statusConfig[status] || statusConfig.open;
  };

  /**
   * الحصول على أيقونة الحالة
   */
  const getStatusIcon = (status: string) => {
    const Icon = getStatusConfig(status).icon;
    return <Icon className="h-4 w-4" />;
  };

  /**
   * تنسيق التاريخ النسبي
   */
  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ar,
    });
  };

  /**
   * التحقق مما إذا كان الخط الزمني فارغاً
   */
  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">لا يوجد نشاط</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          لم يتم تسجيل أي تغييرات على هذه الشكوى حتى الآن
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* الخط الزمني العمودي */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      {/* عناصر الخط الزمني */}
      <div className="space-y-8">
        {timeline.map((item, index) => {
          const config = getStatusConfig(item.status);
          const isLast = index === timeline.length - 1;

          return (
            <div
              key={`${item.status}-${item.timestamp.getTime()}`}
              className="relative flex items-start gap-4"
            >
              {/* دائرة الحالة */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background transition-all duration-200",
                    config.bgColor,
                    config.textColor,
                  )}
                >
                  {getStatusIcon(item.status)}
                </div>

                {/* خط الاتصال بين العناصر */}
                {!isLast && <div className="w-0.5 h-8 bg-border mt-2" />}
              </div>

              {/* محتوى العنصر */}
              <div className="flex-1 min-w-0 pb-8">
                {/* رأس العنصر */}
                <div className="flex items-center gap-3 mb-2">
                  {/* شارة الحالة */}
                  <Badge variant={config.variant} className="font-medium">
                    {config.label}
                  </Badge>

                  {/* التاريخ النسبي */}
                  <span className="text-sm text-muted-foreground">{formatRelativeTime(item.timestamp)}</span>
                </div>

                {/* ملاحظات النشاط */}
                {item.notes && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.notes}</p>
                )}

                {/* معلومات الفاعل */}
                {item.actor && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src="" alt={item.actor} />
                      <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                        {item.actor
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>بواسطة: {item.actor}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
