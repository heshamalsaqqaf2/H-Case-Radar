import { ProtectedComponent } from "@/components/auth/protected-component";
import AreaChart1 from "@/components/ui/reui/charts/area-charts/area-chart-1";
import LineChart8 from "@/components/ui/reui/charts/line-charts/line-chart-8";
import StatisticCard2 from "@/components/ui/reui/statistic-cards/statistic-card-2";
import StatisticCard15 from "@/components/ui/reui/statistic-cards/statistic-card-15";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/user/dashboard/layout/app-sidebar";
import { ChartAreaInteractive } from "@/components/user/dashboard/layout/chart-area-interactive";
import { DataTable } from "@/components/user/dashboard/layout/data-table";
import { SectionCards } from "@/components/user/dashboard/layout/section-cards";
import { SiteHeader } from "@/components/user/dashboard/layout/site-header";
import data from "./data.json";

export default function Page() {
  return (
    <ProtectedComponent permission="user.dashboard.view">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="floating" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <AreaChart1 />
                <LineChart8 />
                <div className="px-4 lg:px-6">
                  <StatisticCard2 />
                  <StatisticCard15 />
                  {/* <ChartAreaInteractive /> */}
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
          {/* <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div> */}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedComponent>
  );
}
