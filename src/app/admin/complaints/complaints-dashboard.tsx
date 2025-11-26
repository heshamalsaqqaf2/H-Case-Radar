// app/admin/complaints/components/complaints-dashboard.tsx
import type { ComplaintStats } from "@/lib/complaints/types/type-complaints";
import { ComplaintsByCategoryChart } from "./components/chart/complaints-by-category-chart";
import { ComplaintsByStatusChart } from "./components/chart/complaints-by-status-chart";
import { ComplaintStatsCards } from "./components/complaint-stats-cards";
import { RecentComplaints } from "./components/recent-complaints";

interface ComplaintsDashboardProps {
  statsResult: {
    success: boolean;
    data?: ComplaintStats;
  };
}

export function ComplaintsDashboard({ statsResult }: ComplaintsDashboardProps) {
  if (!statsResult.success || !statsResult.data) {
    return (
      <main className="container mx-auto p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-600">فشل في تحميل الإحصائيات</h1>
          <p className="text-gray-600 mt-2">لا يمكن تحميل البيانات, يرجى المحاولة لاحقا</p>
        </div>
      </main>
    );
  }

  const stats = statsResult.data;
  return (
    <div className="grid gap-6">
      <ComplaintStatsCards stats={stats} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ComplaintsByStatusChart stats={stats} />
        <ComplaintsByCategoryChart stats={stats} />
      </div>
      <RecentComplaints />
    </div>
  );
}
