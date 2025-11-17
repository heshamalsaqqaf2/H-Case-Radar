// components/complaints/complaint-timeline.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ComplaintProfileData } from "@/lib/complaints/types/type-complaints";
import { cn } from "@/lib/utils";

interface ComplaintTimelineProps {
  timeline: ComplaintProfileData["timeline"];
}

export function ComplaintTimeline({ timeline }: ComplaintTimelineProps) {
  const getStatusBadge = (status: string, notes: string | null) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
    > = {
      open: { label: "مفتوحة", variant: "default" },
      in_progress: { label: "قيد التنفيذ", variant: "secondary" },
      resolved: { label: "تم الحل", variant: "default" },
      closed: { label: "مغلقة", variant: "outline" },
      unresolved: { label: "لم تحل", variant: "destructive" },
      escalated: { label: "مُصعّدة", variant: "secondary" }, // سيتم تحديثه
      on_hold: { label: "معلقة", variant: "outline" },
      reopened: { label: "أُعيد فتحها", variant: "secondary" },
    };

    const config = statusConfig[status];
    let label = config.label;

    // ✅ تحسين عرض حالة التصعيد
    if (status === "escalated" && notes) {
      const levelMatch = notes.match(/المستوى: (.+)/);
      const level = levelMatch ? levelMatch[1] : "غير محدد";
      label = `مُصعّدة (${level})`;
    }

    return <Badge variant={config.variant}>{label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "escalated":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case "reopened":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {timeline.map((item, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                item.status === "resolved"
                  ? "border-green-500 bg-green-500 text-white"
                  : item.status === "closed"
                    ? "border-gray-500 bg-gray-500 text-white"
                    : item.status === "escalated"
                      ? "border-orange-500 bg-orange-500 text-white"
                      : item.status === "reopened"
                        ? "border-yellow-500 bg-yellow-500 text-white"
                        : "border-blue-500 bg-blue-500 text-white",
              )}
            >
              {getStatusIcon(item.status) || index + 1}
            </div>
            {index < timeline.length - 1 && <div className="w-0.5 h-16 bg-border mt-2" />}
          </div>

          <div className="flex-1 space-y-2 pb-6">
            <div className="flex items-center gap-2">
              {getStatusBadge(item.status, item.notes)}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: ar })}
              </span>
            </div>

            {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}

            {item.actor && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src="" alt={item.actor} />
                  <AvatarFallback className="text-[10px]">
                    {item.actor
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span>بواسطة: {item.actor}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
