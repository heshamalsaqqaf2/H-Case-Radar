// app/admin/complaints/components/complaints-by-category-chart.tsx
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplaintStats } from "@/lib/complaints/types/type-complaints";

interface ComplaintsByCategoryChartProps {
  stats: ComplaintStats;
}

export function ComplaintsByCategoryChart({ stats }: ComplaintsByCategoryChartProps) {
  const data = Object.entries(stats.byCategory).map(([category, count]) => ({
    name: category,
    count: count,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>الشكاوى حسب الفئة</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
