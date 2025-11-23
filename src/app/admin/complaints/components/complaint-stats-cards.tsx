/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { Icon24Hours, IconFiretruck, IconKeyOff, IconLineHeight, IconProgress } from "@tabler/icons-react";
import {
  AlertTriangle,
  CheckCircle,
  ClockArrowDown,
  FileText,
  RotateCcw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { ComplaintStats } from "@/lib/complaints/types/type-complaints";

interface ComplaintStatsCardsProps {
  stats: ComplaintStats;
}

// Business Case 1: SaaS Revenue Tracking
const revenueData = [
  { value: 1000 },
  { value: 4500 },
  { value: 2000 },
  { value: 5200 },
  { value: 1500 },
  { value: 6100 },
  { value: 3000 },
  { value: 6800 },
  { value: 2000 },
  { value: 1000 },
  { value: 4000 },
  { value: 2000 },
  { value: 3000 },
  { value: 2000 },
  { value: 6238 },
];

// Business Case 2: New Customer Acquisition
const customersData = [
  { value: 2000 },
  { value: 4500 },
  { value: 2000 },
  { value: 5200 },
  { value: 1500 },
  { value: 5100 },
  { value: 2500 },
  { value: 6800 },
  { value: 1800 },
  { value: 1000 },
  { value: 3000 },
  { value: 2000 },
  { value: 2700 },
  { value: 2000 },
  { value: 4238 },
];

// Business Case 3: Monthly Active Users
const activeUsersData = [
  { value: 2000 },
  { value: 3500 },
  { value: 2000 },
  { value: 5200 },
  { value: 1200 },
  { value: 4100 },
  { value: 3500 },
  { value: 5800 },
  { value: 2000 },
  { value: 800 },
  { value: 3000 },
  { value: 1000 },
  { value: 4000 },
  { value: 2000 },
  { value: 4238 },
];

export function ComplaintStatsCards({ stats }: ComplaintStatsCardsProps) {
  const statCards = [
    {
      period: "ast 28 days",
      timestamp: "",
      data: revenueData,
      color: "var(--color-blue-500)",
      gradientId: "revenueGradient",
      title: "إجمالي البلاغات",
      value: stats.total,
      icon: FileText,
      description: "جميع البلاغات في النظام",
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: customersData,
      color: "var(--color-yellow-500)",
      gradientId: "customersGradient",
      title: "مفتوحة",
      value: stats.open,
      icon: Icon24Hours,
      description: "شكاوى تحتاج إلى معالجة",
      variant: "default" as const,
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: activeUsersData,
      color: "var(--color-cyan-500)",
      gradientId: "inProgressGradient",
      title: "قيد التنفيذ",
      value: stats.inProgress,
      icon: IconProgress,
      description: "شكاوى قيد المعالجة",
      variant: "secondary" as const,
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: activeUsersData,
      color: "var(--color-green-500)",
      gradientId: "usersGradient",
      title: "تم حلها",
      value: stats.resolved,
      icon: CheckCircle,
      description: "شكاوى تم حلها بنجاح",
      variant: "default" as const,
    },
    {
      period: "إجمالي عددها",
      timestamp: "",
      data: revenueData,
      color: "var(--color-fuchsia-500)",
      gradientId: "revenueGradient",
      title: "مغلقة",
      value: stats.closed,
      icon: IconKeyOff,
      description: "شكاوى تم إغلاقها",
      variant: "outline" as const,
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: revenueData,
      color: "var(--color-red-600)",
      gradientId: "revenueGradient",
      title: "لم تحل",
      value: stats.unresolved,
      icon: XCircle,
      description: "شكاوى تم إغلاقها دون حل",
      variant: "destructive" as const,
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: revenueData,
      color: "var(--color-violet-500)",
      gradientId: "revenueGradient",
      title: "مُصعّدة",
      value: stats.escalated,
      icon: TrendingUp,
      description: "شكاوى تم تصعيدها",
      variant: "secondary" as const,
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: customersData,
      color: "var(--color-orange-500)",
      gradientId: "customersGradient",
      title: "معلقة",
      value: stats.onHold,
      icon: AlertTriangle,
      description: "شكاوى معلقة مؤقتاً",
      variant: "outline" as const,
    },

    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: activeUsersData,
      color: "var(--color-rose-500)",
      gradientId: "",
      title: "عاجلة",
      value: stats.urgent,
      icon: IconFiretruck,
      description: "شكاوى تحتاج إلى اهتمام ",
      variant: "destructive" as const,
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: revenueData,
      color: "var(--color-teal-500)",
      gradientId: "revenueGradient",
      title: "أُعيد فتحها",
      value: stats.reopened,
      icon: RotateCcw,
      description: "شكاوى تمت إعادة فتحها",
      variant: "secondary" as const,
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: revenueData,
      color: "var(--color-amber-500)",
      gradientId: "revenueGradient",
      title: "ذات أولوية عالية",
      value: stats.highPriority,
      icon: IconLineHeight,
      description: "شكاوى ذات أولوية عالية",
      variant: "destructive" as const,
    },
    {
      period: "أخر 28 يوم",
      timestamp: "",
      data: revenueData,
      color: "var(--color-red-500)",
      gradientId: "revenueGradient",
      title: "متأخرة",
      value: stats.overdue,
      icon: ClockArrowDown,
      description: "شكاوى تجاوزت موعد الحل",
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="@container w-full max-w-7xl">
        <div className="grid grid-cols-4 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i}>
                <CardContent className="space-y-5">
                  {/* Header with icon and title */}
                  <div className="flex items-center gap-2">
                    <Icon className="size-5" style={{ color: card.color }} />
                    <span className="text-base font-semibold">{card.title}</span>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">{card.description}</div>

                  <div className="flex items-end gap-2.5 justify-between">
                    {/* Details */}
                    <div className="flex flex-col gap-1">
                      {/* Period */}
                      <div className="text-sm text-muted-foreground whitespace-nowrap">{card.period}</div>

                      {/* Value */}
                      <div className="text-3xl font-bold text-foreground tracking-tight">{card.value}</div>
                    </div>

                    {/* Chart */}
                    <div className="max-w-50 h-16 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={card.data}
                          margin={{
                            top: 5,
                            right: 5,
                            left: 5,
                            bottom: 5,
                          }}
                        >
                          <defs>
                            <linearGradient id={card.gradientId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={card.color} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={card.color} stopOpacity={0.05} />
                            </linearGradient>
                            <filter id={`dotShadow${i}`} x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
                            </filter>
                          </defs>

                          <Tooltip
                            cursor={{
                              stroke: card.color,
                              strokeWidth: 1,
                              strokeDasharray: "2 2",
                            }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const value = payload[0].value as number;
                                const formatValue = (val: number) => {
                                  if (card.title === "Revenue") {
                                    return `${(val / 1000).toFixed(1)}k US$`;
                                  } else if (card.title === "New Customers") {
                                    return `${(val / 1000).toFixed(1)}k`;
                                  } else {
                                    return `${(val / 1000).toFixed(1)}k`;
                                  }
                                };

                                return (
                                  <div className="bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-2 pointer-events-none">
                                    <p className="text-sm font-semibold text-foreground">
                                      {formatValue(value)}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                          {/* Area with gradient and enhanced shadow */}
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={card.color}
                            fill={`url(#${card.gradientId})`}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 6,
                              fill: card.color,
                              stroke: "white",
                              strokeWidth: 2,
                              filter: `url(#dotShadow${i})`,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// const businessCards = [
//   {
//     title: "Revenue",
//     period: "أخر 28 يوم",
//     value: "6.238$",
//     timestamp: "",
//     data: revenueData,
//     color: "var(--color-emerald-500)",
//     icon: CircleDollarSign,
//     gradientId: "revenueGradient",
//   },
//   {
//     title: "New Customers",
//     period: "أخر 28 يوم",
//     value: "6.202",
//     timestamp: "3h ago",
//     data: customersData,
//     color: "var(--color-blue-500)",
//     icon: UserPlus,
//     gradientId: "customersGradient",
//   },
//   {
//     title: "Active Users",
//     period: "أخر 28 يوم",
//     value: "18.945",
//     timestamp: "1h ago",
//     data: activeUsersData,
//     color: "var(--color-violet-500)",
//     icon: TrendingUp,
//     gradientId: "usersGradient",
//   },
//   {
//     title: "Active Users",
//     period: "أخر 28 يوم",
//     value: "18.945",
//     timestamp: "1h ago",
//     data: activeUsersData,
//     color: "var(--color-yellow-500)",
//     icon: TrendingUp,
//     gradientId: "usersGradient",
//   },
// ];

// return (
//   <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//     {statCards.map((card) => {
//       const Icon = card.icon;
//       return (
//         <Card key={card.title} className="relative overflow-hidden">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
//             <Icon className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{card.value}</div>
//             <p className="text-xs text-muted-foreground">{card.description}</p>
//             {card.variant && (
//               <Badge variant={card.variant} className="absolute bottom-2 right-2 text-xs">
//                 {card.value > 0 ? "يتطلب انتباه" : "لا يوجد"}
//               </Badge>
//             )}
//           </CardContent>
//         </Card>
//       );
//     })}
//   </div>
// );
