"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { day: "Mon", visitors: 400 },
  { day: "Tue", visitors: 300 },
  { day: "Wed", visitors: 550 },
  { day: "Thu", visitors: 450 },
  { day: "Fri", visitors: 600 },
  { day: "Sat", visitors: 400 },
  { day: "Sun", visitors: 500 },
];

import { ScifiCorner, ScifiScanline } from "@/components/dashboard/shared/scifi-decorations";

export function WebsiteTrafficChart() {
  return (
    <Card className="scifi-card h-full relative overflow-hidden group">
      <ScifiScanline />
      <ScifiCorner position="top-left" />
      <ScifiCorner position="top-right" />
      <ScifiCorner position="bottom-left" />
      <ScifiCorner position="bottom-right" />

      <CardHeader className="relative z-10">
        <CardTitle className="text-base font-semibold text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
          Website Traffic
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 242, 255, 0.05)' }}
              contentStyle={{
                backgroundColor: '#0a1019',
                border: '1px solid rgba(0, 242, 255, 0.2)',
                borderRadius: '8px',
                boxShadow: '0 0 15px rgba(0, 242, 255, 0.1)',
              }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Bar
              dataKey="visitors"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              barSize={12}
            >
            </Bar>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f2ff" />
                <stop offset="100%" stopColor="#00f2ff" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
