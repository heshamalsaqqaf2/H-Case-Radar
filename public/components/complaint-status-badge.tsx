import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/lib/complaints/types/type-complaints";
import { cn } from "@/lib/utils";

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

const statusConfig: Record<
  ComplaintStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  open: { label: "مفتوحة", variant: "default" },
  in_progress: { label: "قيد التنفيذ", variant: "secondary" },
  resolved: { label: "تم الحل", variant: "default" },
  closed: { label: "مغلقة", variant: "outline" },
  unresolved: { label: "لم تحل", variant: "destructive" },
  escalated: { label: "تم التصعيد", variant: "destructive" },
  on_hold: { label: "معلقة", variant: "outline" },
  reopened: { label: "أعيد فتحها", variant: "secondary" },
};

export function ComplaintStatusBadge({ status, className }: ComplaintStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn("text-xs font-medium", className)}>
      {config.label}
    </Badge>
  );
}
