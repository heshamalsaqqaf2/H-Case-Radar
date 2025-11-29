import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { SiteHeader } from "@/components/dashboard/layout/site-header";
import { ProductsOverviewTable } from "@/components/dashboard/widgets/products-overview-table";
import { ProfitChart } from "@/components/dashboard/widgets/profit-chart";
import { RecentOrdersTable } from "@/components/dashboard/widgets/recent-orders-table";
import { StatsCards } from "@/components/dashboard/widgets/stats-cards";
import { WebsiteTrafficChart } from "@/components/dashboard/widgets/website-traffic-chart";
import { WorldMap } from "@/components/ui/Aceternity-UI/world-map";
import { Globe } from "@/components/ui/magic-ui/globe";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { requireMultiplePermissions } from "@/utils/has-authorization";

export default async function DashboardPage() {
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
          "--sidebar-width": "16rem", // 256px
          "--header-height": "4rem", // 64px
        } as React.CSSProperties
      }
    >
      <AppSidebar collapsible="icon" variant="floating" side="right" />
      <SidebarInset className="bg-transparent overflow-x-hidden relative">
        {/* Full Page Gradient Glow Effect - From Bottom */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-linear-to-t from-emerald-500/30 via-teal-600/10 via-30% to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t from-cyan-500/20 via-emerald-500/10 to-transparent blur-3xl" />
        </div>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 gap-6 relative z-10">
          {/* Row 1: Top Stats Cards */}
          <div className="animate-slide-up-fade">
            <StatsCards />
          </div>

          {/* Row 2: Charts (Traffic, Sales, Profit) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up-fade delay-100">
            <div className="lg:col-span-3 min-h-[350px]">
              <WebsiteTrafficChart />
            </div>
            <div className="lg:col-span-6 min-h-[450px]">
              <Globe className="mt-[-30]" />
            </div>
            <div className="lg:col-span-3 min-h-[350px]">
              <ProfitChart />
            </div>
          </div>

          {/* Row 3: Map & Recent Orders */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up-fade delay-200"> */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up-fade delay-200">
            <div className="lg:col-span-7 min-h-[400px]">
              <WorldMap />
              {/* <SalesChart /> */}
              {/* <CountrySalesMap /> */}
            </div>
            <div className="lg:col-span-5 max-h-[400px]">
              <RecentOrdersTable />
            </div>
          </div>

          {/* Row 4: Products Overview */}
          <div className="w-full animate-slide-up-fade delay-300">
            <ProductsOverviewTable />
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

