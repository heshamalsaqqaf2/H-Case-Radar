// components/dashboard/card-error.tsx
"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardErrorProps {
  title?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

export function CardError({
  title = "تعذر تحميل المحتوى",
  onRetry,
  compact = false,
  className,
}: CardErrorProps) {
  if (compact) {
    return (
      <Card className={cn("bg-destructive/5 border-destructive/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">{title}</span>
            </div>
            {onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry} className="h-8 px-2">
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-destructive/5 border-destructive/20", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">حدث خطأ أثناء تحميل البيانات</p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
