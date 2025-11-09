import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import { AuditLogsTable } from "./components/audit-logs-table";

export default async function AuditLogsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");

  const check = await authorizationService.checkPermission(
    { userId, environment: {} },
    AUDIT_LOG_ACTIONS.AUDIT_LOG.ACCESS,
  );
  if (!check.allowed) redirect("/admin/audit-logs");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">السجلات الأمنية</h1>
        <p className="text-muted-foreground">
          تتبع كل إجراء تم تنفيذه في النظام مع التفاصيل الكاملة.
        </p>
      </div>
      <AuditLogsTable />
    </div>
  );
}
