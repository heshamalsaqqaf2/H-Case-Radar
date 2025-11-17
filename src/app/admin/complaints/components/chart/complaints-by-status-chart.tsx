// app/admin/complaints/components/complaints-by-status-chart.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplaintStats } from "@/lib/complaints/types/type-complaints";

interface ComplaintsByStatusChartProps {
  stats: ComplaintStats;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B6B"];

const statusLabels: Record<string, string> = {
  open: "مفتوحة",
  in_progress: "قيد التنفيذ",
  resolved: "تم حلها",
  closed: "مغلقة",
  unresolved: "لم تحل",
  escalated: "مُصعّدة",
  on_hold: "معلقة",
  reopened: "أُعيد فتحها",
};

export function ComplaintsByStatusChart({ stats }: ComplaintsByStatusChartProps) {
  const data = Object.entries(stats.byStatus).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>توزيع الشكاوى حسب الحالة</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
