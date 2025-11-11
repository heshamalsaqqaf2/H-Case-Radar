import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { SectionCards } from "@/components/dashboard/layout/section-cards";
import { SiteHeader } from "@/components/dashboard/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { requireMultiplePermissions } from "@/utils/has-authorization";

export default async function DashboardPage() {
  // استخدام واحد
  // const hasAuthorizationAccessDashboard = await requireAuthorization(
  //   AUDIT_LOG_ACTIONS.DASHBOARD.ACCESS,
  //   "ليس لديك صلاحية للوصول للوحة التحكم",
  // );

  // if (hasAuthorizationAccessDashboard !== true) return hasAuthorizationAccessDashboard;

  // أو استخدام متعدد
  const hasMultipleAuthorization = await requireMultiplePermissions([
    {
      perm: AUDIT_LOG_ACTIONS.DASHBOARD.ACCESS,
      message: `ليس لديك صلاحية للوصول لهذه الصفحة ${AUDIT_LOG_ACTIONS.DASHBOARD.ACCESS.toUpperCase()}`,
    },
    {
      perm: AUDIT_LOG_ACTIONS.DASHBOARD.VIEW,
      message: `ليس لديك صلاحية عرض مكونات لوحة التحكم ${AUDIT_LOG_ACTIONS.DASHBOARD.VIEW.toUpperCase()}`,
    },
  ]);

  if (hasMultipleAuthorization !== true) return hasMultipleAuthorization;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar collapsible="icon" variant="floating" side="right" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              {/* <AreaChart1 /> */}
              {/* <LineChart8 /> */}
              {/* <DataTable data={data} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
