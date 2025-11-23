// components/dashboard/data-error.tsx
"use client";

import { FileText, FilterX, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataErrorProps {
  type?: "no-data" | "filter" | "error";
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function DataError({
  type = "no-data",
  title,
  description,
  actionText,
  onAction,
  className,
}: DataErrorProps) {
  const config = {
    "no-data": {
      icon: Table,
      title: "لا توجد بيانات",
      description: "لم يتم العثور على أي سجلات حتى الآن",
      action: "إضافة بيانات جديدة",
    },
    filter: {
      icon: FilterX,
      title: "لا توجد نتائج",
      description: "لمطابقة معايير البحث المحددة",
      action: "مسح الفلتر",
    },
    error: {
      icon: FileText,
      title: "خطأ في التحميل",
      description: "تعذر تحميل البيانات. يرجى المحاولة مرة أخرى",
      action: "إعادة المحاولة",
    },
  };

  const { icon: Icon, title: defaultTitle, description: defaultDesc, action: defaultAction } = config[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center",
        "bg-muted/30 rounded-lg border border-dashed",
        className,
      )}
    >
      <div className="space-y-4 max-w-xs">
        <Icon className="w-12 h-12 text-muted-foreground/60 mx-auto" />

        <div className="space-y-2">
          <h4 className="font-medium text-foreground">{title || defaultTitle}</h4>
          <p className="text-sm text-muted-foreground">{description || defaultDesc}</p>
        </div>

        {onAction && (
          <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
            {actionText || defaultAction}
          </Button>
        )}
      </div>
    </div>
  );
}
