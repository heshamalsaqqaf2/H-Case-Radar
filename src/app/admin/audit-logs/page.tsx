// src/app/admin/audit-logs/page.tsx
import { AuditLogsDashboard } from "./components/audit-logs-dashboard";

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <AuditLogsDashboard />
    </div>
  );
}
