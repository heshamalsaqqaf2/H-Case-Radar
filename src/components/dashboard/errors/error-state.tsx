// components/dashboard/errors/error-state.tsx
"use client";

import { AlertCircle, Check, ChevronDown, ChevronUp, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { AppError } from "@/lib/errors/error-types";
import { cn } from "@/lib/utils";

interface DashboardErrorProps {
  className?: string;
  title?: string;
  description?: string;
  action?: string;
  onAction?: () => Promise<void> | void;
  error?: AppError;
}

export function DashboardError({
  className,
  title = "حدث خطأ",
  description = "عذراً، حدث خطأ غير متوقع",
  action = "إعادة المحاولة",
  onAction,
  error,
}: DashboardErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const copyErrorDetails = async () => {
    const errorText = `${error}
    `.trim();

    await navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async () => {
    if (!onAction) return;
    setIsRetrying(true);
    try {
      await onAction();
    } catch (error) {
      console.error("فشلت إعادة المحاولة:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className={cn("border-dashed bg-destructive/5", className)}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Error Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-background border">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>

          {/* Text Content */}
          <div className="space-y-4 max-w-sm">
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>

            {/* عرض رسالة الخطأ الرئيسية */}
            {error?.message && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium text-sm">{error?.message}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {onAction && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isRetrying}
              onClick={handleRetry}
              className="gap-2"
            >
              {isRetrying ? (
                <Spinner />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {action}
                </>
              )}
            </Button>
          )}

          {/* Technical Details - دائماً معروضة ولكن قابلة للطي */}
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="gap-2"
              >
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                التفاصيل التقنية
              </Button>

              <Button variant="outline" size="sm" onClick={copyErrorDetails} className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {showDetails && (
              <div className="bg-background border rounded-lg p-4 text-left space-y-3 text-sm">
                <span className="font-medium text-muted-foreground min-w-20">التفاصيل:</span>
                {/* الرسالة التفصيلية */}
                {error?.message && (
                  <div className="flex items-start gap-3">
                    <span className="text-foreground flex-1">كود الخطاء: {error?.code}</span>
                  </div>
                )}
                {error?.message && (
                  <div className="flex items-end gap-3">
                    <span className="text-foreground flex-1">كود الخطاء: {error?.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
