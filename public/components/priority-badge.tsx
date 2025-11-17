import { AlertCircle, AlertTriangle, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "critical";
  className?: string;
}

const priorityConfig = {
  low: { label: "منخفض", variant: "outline" as const, icon: Info, className: "text-green-600" },
  medium: { label: "متوسط", variant: "secondary" as const, icon: Clock, className: "text-blue-600" },
  high: { label: "عالي", variant: "default" as const, icon: AlertTriangle, className: "text-orange-600" },
  critical: { label: "حرج", variant: "destructive" as const, icon: AlertCircle, className: "text-red-600" },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("flex items-center gap-1 text-xs font-medium", className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
