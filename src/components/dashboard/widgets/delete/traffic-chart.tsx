"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "Jan", desktop: 186 },
  { month: "Feb", desktop: 305 },
  { month: "Mar", desktop: 237 },
  { month: "Apr", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "Jun", desktop: 214 },
  { month: "Jul", desktop: 186 },
  { month: "Aug", desktop: 305 },
  { month: "Sep", desktop: 237 },
  { month: "Oct", desktop: 73 },
  { month: "Nov", desktop: 209 },
  { month: "Dec", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Traffic",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TrafficChart() {
  return (
    <Card className="scifi-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">Website Traffic</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} stroke="rgba(0, 242, 255, 0.08)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke="#64748b"
              style={{ fontSize: '11px' }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0, 242, 255, 0.05)' }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="desktop"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              barSize={6}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f2ff" stopOpacity={1} />
                <stop offset="100%" stopColor="#00f2ff" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
