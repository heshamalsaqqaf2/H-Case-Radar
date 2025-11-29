"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chartData = [
  { month: "Jan", sales: 400, refunds: 240 },
  { month: "Feb", sales: 300, refunds: 139 },
  { month: "Mar", sales: 550, refunds: 380 },
  { month: "Apr", sales: 450, refunds: 290 },
  { month: "May", sales: 600, refunds: 450 },
  { month: "Jun", sales: 800, refunds: 550 },
  { month: "Jul", sales: 700, refunds: 400 },
  { month: "Aug", sales: 900, refunds: 600 },
  { month: "Sep", sales: 650, refunds: 450 },
  { month: "Oct", sales: 750, refunds: 500 },
  { month: "Nov", sales: 600, refunds: 400 },
  { month: "Dec", sales: 500, refunds: 300 },
];

import { ScifiCorner, ScifiScanline } from "@/components/dashboard/shared/scifi-decorations";

export function SalesChart() {
  return (
    <Card className="scifi-card h-full relative overflow-hidden group">
      <ScifiScanline />
      <ScifiCorner position="top-left" />
      <ScifiCorner position="top-right" />
      <ScifiCorner position="bottom-left" />
      <ScifiCorner position="bottom-right" />

      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-base font-semibold text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
          Sales Statistics
        </CardTitle>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] shadow-[0_0_6px_rgba(0,242,255,0.8)]" />
            <span className="text-muted-foreground">Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="text-muted-foreground">Refunds</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4 h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRefunds" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a1019',
                border: '1px solid rgba(0, 242, 255, 0.2)',
                borderRadius: '8px',
                boxShadow: '0 0 15px rgba(0, 242, 255, 0.1)',
              }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#00f2ff"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(0, 242, 255, 0.3))'
              }}
            />
            <Area
              type="monotone"
              dataKey="refunds"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRefunds)"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

