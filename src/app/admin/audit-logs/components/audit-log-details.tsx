// src/app/admin/audit-logs/components/audit-log-details.tsx
"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Activity,
  Clock,
  FileText,
  Fingerprint,
  Globe,
  type LucideIcon,
  Monitor,
  Shield,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // استيراد مكونات البطاقة
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // استيراد مكونات التبويبات
import type { AuditLog } from "@/lib/database/schema";

interface AuditLogDetailsProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

// مكون بسيط لعرض صف من المعلومات داخل البطاقات
function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground min-w-fit">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function AuditLogDetails({ log, isOpen, onClose }: AuditLogDetailsProps) {
  if (!log) return null;

  // دالة للحصول على لون مستوى الخطورة (للشريط العلوي والشارات)
  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case "critical":
        return { bg: "bg-red-500", border: "border-red-500", text: "text-red-600", badge: "destructive" };
      case "high":
        return {
          bg: "bg-orange-500",
          border: "border-orange-500",
          text: "text-orange-600",
          badge: "secondary",
        };
      case "medium":
        return {
          bg: "bg-yellow-500",
          border: "border-yellow-500",
          text: "text-yellow-600",
          badge: "outline",
        };
      case "low":
        return { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-600", badge: "outline" };
      default:
        return { bg: "bg-gray-500", border: "border-gray-500", text: "text-gray-600", badge: "outline" };
    }
  };

  const severityColors = getSeverityColor(log.severity);
  const hasExtraDetails = log.description || log.details;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        {/* --- إضافة شريط علوي ملون للإشارة إلى الخطورة --- */}
        <div className={`h-1 ${severityColors.bg} rounded-t-lg`} />

        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center justify-start gap-2 text-xl">
            <Shield className="h-6 w-6" />
            تفاصيل سجل التدقيق
          </DialogTitle>
          <DialogDescription>معلومات تفصيلية عن النشاط المسجل</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* --- البطاقة الأولى: جوهر الحدث --- */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <span>الحدث</span>
                  </div>
                  <Badge variant={severityColors.badge} className={severityColors.text}>
                    {log.severity === "critical"
                      ? "حرج"
                      : log.severity === "high"
                        ? "عالي"
                        : log.severity === "medium"
                          ? "متوسط"
                          : log.severity === "low"
                            ? "منخفض"
                            : "معلومات"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="text-lg bg-muted px-3 py-1 rounded-md font-semibold">{log.action}</code>
                  <span className="text-muted-foreground">على</span>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {log.entity}
                  </Badge>
                  {log.entityId && <code className="text-sm text-muted-foreground">({log.entityId})</code>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow
                    icon={User}
                    label="المستخدم"
                    value={log.userId === "anonymous" ? "مجهول" : log.userId}
                  />
                  <InfoRow
                    icon={Activity}
                    label="الحالة"
                    value={
                      log.status === "success" ? "✅ ناجح" : log.status === "failure" ? "❌ فاشل" : "⚠️ تحذير"
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    السياق التقني والزمني
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow
                    icon={Clock}
                    label="التاريخ والوقت"
                    value={format(new Date(log.createdAt), "PPPPpp", { locale: ar })}
                  />
                  <InfoRow icon={Fingerprint} label="عنوان IP" value={log.ipAddress || "غير معروف"} />
                  <InfoRow
                    icon={Globe}
                    label="البلد والمدينة"
                    value={
                      log.country && log.city
                        ? `${log.country}, ${log.city}`
                        : log.country || log.city || "غير معروف"
                    }
                  />
                  <InfoRow
                    icon={Monitor}
                    label="المتصفح"
                    value={
                      log.userAgent
                        ? log.userAgent.length > 60
                          ? `${log.userAgent.slice(0, 60)}...`
                          : log.userAgent
                        : "غير معروف"
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* --- البطاقة الثالثة: التفاصيل الإضافية (باستخدام التبويبات) --- */}
            {hasExtraDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    التفاصيل الإضافية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="description">الوصف</TabsTrigger>
                      <TabsTrigger value="technical">التفاصيل الفنية (JSON)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="mt-4">
                      {log.description ? (
                        <p className="text-sm bg-muted/50 p-3 rounded-md">{log.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">لا يوجد وصف متاح.</p>
                      )}
                    </TabsContent>
                    <TabsContent value="technical" className="mt-4">
                      {log.details ? (
                        <pre className="text-xs bg-muted/80 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(
                            typeof log.details === "string" ? JSON.parse(log.details) : log.details,
                            null,
                            2,
                          )}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">لا توجد تفاصيل فنية متاحة.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
