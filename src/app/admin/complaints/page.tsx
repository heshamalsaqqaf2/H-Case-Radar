// app/admin/complaints/page.tsx

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { HeaderDashboardPage } from "@/components/admin/header-dashboard-page";
import { LoadingState } from "@/components/shared/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import { getComplaintStatsAction } from "@/lib/complaints/actions/complaints-actions";
import { ComplaintsDashboard } from "./complaints-dashboard";
import { ComplaintsList } from "./components/complaints-list";

export default async function ComplaintsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");

  const hasAccessRole = await authorizationService.checkPermission(
    { userId },
    AUDIT_LOG_ACTIONS.COMPLAINT.ACCESS,
  );
  const hasViewRole = await authorizationService.checkPermission(
    { userId },
    AUDIT_LOG_ACTIONS.COMPLAINT.VIEW,
  );

  if (!hasAccessRole.allowed) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">غير مصرح</h1>
        <p className="text-gray-600 mt-2">ليس لديك صلاحية للوصول للبلاغات</p>
      </div>
    );
  }
  if (!hasViewRole.allowed) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">غير مصرح</h1>
        <p className="text-gray-600 mt-2">ليس لديك صلاحية لعرض البلاغات</p>
      </div>
    );
  }

  const statsResult = await getComplaintStatsAction();

  return (
    <div className="space-y-6 px-5">
      <HeaderDashboardPage
        title="إدارة الشكاوى"
        description="عرض وإدارة جميع الشكاوى في النظام للمستفيدين"
      />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">لوحة إحصائيات البلاغات</TabsTrigger>
          <TabsTrigger value="list">قائمة البلاغات</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Suspense fallback={<LoadingState />}>
            <ComplaintsDashboard statsResult={statsResult} />
          </Suspense>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Suspense fallback={<LoadingState />}>
            <ComplaintsList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
