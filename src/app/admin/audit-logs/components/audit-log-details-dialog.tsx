"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Clock, Hash, ScrollText, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AuditLog } from "@/lib/database/schema";

interface AuditLogDetailsDialogProps {
  log: AuditLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailsDialog({
  log,
  open,
  onOpenChange,
}: AuditLogDetailsDialogProps) {
  // تنسيق تفاصيل JSON
  const formattedDetails = log.details
    ? JSON.stringify(JSON.parse(log.details), null, 2)
    : "لا توجد تفاصيل";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل السجل الأمني</DialogTitle>
          <DialogDescription>
            معلومات كاملة عن الإجراء المُسجّل.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                المعرف
              </CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-sm">{log.id}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                المستخدم
              </CardTitle>
            </CardHeader>
            <CardContent>
              {log.userId === "anonymous" ? "مجهول" : log.userId}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                الإجراء والكيان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">الإجراء:</span>{" "}
                  <span className="font-mono">{log.action}</span>
                </div>
                <div>
                  <span className="font-medium">الكيان:</span>{" "}
                  <span className="capitalize">{log.entity}</span>
                </div>
                <div>
                  <span className="font-medium">معرف الكيان:</span>{" "}
                  <span className="font-mono">{log.entityId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التفاصيل</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto">
                {formattedDetails}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                وقت الإجراء
              </CardTitle>
            </CardHeader>
            <CardContent>
              {format(new Date(log.createdAt), "PPP p", { locale: ar })}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
