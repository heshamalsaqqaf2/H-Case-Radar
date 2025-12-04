import { ChartAreaInteractive } from "@/components/dashboard/layout/chart-area-interactive";
import { DataTable } from "@/components/dashboard/layout/data-table";
import { SectionCards } from "@/components/dashboard/layout/section-cards";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { requireMultiplePermissions } from "@/utils/has-authorization";

import data from "../../dashboard_old/data.json";
import { ChartBarActive } from "./charts/chart-bar-active";
import { ChartBarInteractive } from "./charts/chart-bar-interactive";
import { ChartLineDefault } from "./charts/chart-line";
import { ChartLineMultiple } from "./charts/chart-line-multiple";
import { ChartPieInteractive } from "./charts/chart-pie-interactive";
import { ChartRadarLegend } from "./charts/chart-radar-legend";
import { ChartRadialGrid } from "./charts/chart-radial-grid";

export default async function AdminDashboardPage() {
  // استخدام واحد
  // const authCheck = await requireAuthorization(
  //   AUDIT_LOG_ACTIONS.ADMIN.ACCESS,
  //   "ليس لديك صلاحية للوصول للأدوار",
  // );

  // if (authCheck !== true) return authCheck;

  // أو استخدام متعدد
  const multiCheck = await requireMultiplePermissions([
    { perm: AUDIT_LOG_ACTIONS.ADMIN.ACCESS, message: "لا يمكنك الوصول للوحة التحكم" },
    { perm: AUDIT_LOG_ACTIONS.ADMIN.VIEW, message: "لا يمكنك من عرض صفحات الوحة التحكم" },
  ]);

  if (multiCheck !== true) return multiCheck;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 py-4 md:gap-6">
          {/* <SectionCards /> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ChartRadialGrid />
            <ChartRadarLegend />
            <ChartPieInteractive />
            <ChartBarActive />
            <ChartLineMultiple />
            <ChartLineDefault />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <ChartAreaInteractive />
            <ChartBarInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
