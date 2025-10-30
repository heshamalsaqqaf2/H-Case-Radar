import { ProtectedComponent } from "@/components/auth/protected-component";
import StatisticCard2 from "@/components/ui/reui/statistic-cards/statistic-card-2";
import StatisticCard15 from "@/components/ui/reui/statistic-cards/statistic-card-15";

export default function StatisticPage() {
  return (
    <ProtectedComponent permission="statistic.view">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistic Charts</h1>
          <p className="text-gray-600 mt-2">
            Show statistic charts, graphs, and reports, and more
          </p>
        </div>
        <StatisticCard2 />
        <StatisticCard15 />
      </div>
    </ProtectedComponent>
  );
}
