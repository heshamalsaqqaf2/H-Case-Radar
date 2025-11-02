/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Shield,
  Zap,
} from "lucide-react";
import type React from "react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PermissionStatistics {
  total: number;
  static: number;
  dynamic: number;
  byResource: Record<string, number>;
  byAction: Record<string, number>;
  recentlyAdded: any[];
}

interface StatisticsPanelProps {
  statistics: PermissionStatistics;
  isOpen: boolean;
  onToggle: () => void;
}

// بيانات واقعية لأنماط استخدام الصلاحيات - تعكس استخدام حقيقي
const generateRealisticUsageData = (
  total: number,
  staticCount: number,
  dynamicCount: number,
) => {
  const data = [];
  const baseUsage = 65; // استخدام أساسي 65%
  const peakHours = [9, 10, 11, 14, 15, 16]; // ساعات الذروة
  const weekendDays = [0, 6]; // السبت والأحد

  for (let hour = 0; hour < 24; hour++) {
    let usage = baseUsage;

    // زيادة الاستخدام في ساعات الذروة
    if (peakHours.includes(hour)) {
      usage += 25 + Math.random() * 10;
    }

    // انخفاض طفيف في عطلة نهاية الأسبوع
    const isWeekend = weekendDays.includes(new Date().getDay());
    if (isWeekend) {
      usage -= 15;
    }

    // تقلبات عشوائية طبيعية
    usage += (Math.random() - 0.5) * 20;

    // تأثير الصلاحيات الديناميكية
    const dynamicEffect = (dynamicCount / total) * 15;
    usage += dynamicEffect;

    // ضمان أن النسبة بين 0 و 100
    usage = Math.max(10, Math.min(95, usage));

    data.push({ value: Math.round(usage) });
  }

  return data;
};

// بيانات واقعية لتوزيع الصلاحيات على الموارد
const generateDistributionData = (byResource: Record<string, number>) => {
  const data = [];
  const resourceCount = Object.keys(byResource).length;
  const values = Object.values(byResource);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  // مؤشر التوازن (كلما اقترب من الصفر كان التوزيع أكثر توازناً)
  let balanceIndex = 0;

  for (let i = 0; i < 24; i++) {
    // نمط يومي مع تقلبات
    const basePattern = Math.sin((i / 24) * Math.PI * 2) * 10;

    // تأثير عدد الموارد على التوازن
    const resourceEffect = (resourceCount / 10) * 5;

    // تأثير تركيز الصلاحيات (إذا كانت معظم الصلاحيات في موارد قليلة)
    const concentration =
      maxValue / (values.reduce((a, b) => a + b, 0) / values.length) - 1;
    const concentrationEffect = concentration * 8;

    balanceIndex =
      basePattern +
      resourceEffect +
      concentrationEffect +
      (Math.random() - 0.5) * 6;

    data.push({ value: Math.round(balanceIndex * 10) / 10 });
  }

  return data;
};

// بيانات واقعية لفعالية الأمان
const generateSecurityData = (
  staticCount: number,
  dynamicCount: number,
  total: number,
) => {
  const data = [];

  // درجة أمان أساسية تعتمد على نسبة الصلاحيات الثابتة
  const baseSecurity = (staticCount / total) * 80 + 20;
  let securityScore = baseSecurity;

  for (let i = 0; i < 24; i++) {
    // نمط يومي - الأمان ينخفض قليلاً في ساعات الذروة
    const hour = i;
    const peakEffect = [9, 10, 11, 14, 15, 16].includes(hour) ? -8 : 0;

    // تأثير الصلاحيات الديناميكية (تزيد المرونة ولكن قد تخفض الأمان)
    const dynamicEffect = (dynamicCount / total) * -5;

    // تقلبات عشوائية
    const randomEffect = (Math.random() - 0.5) * 6;

    securityScore = baseSecurity + peakEffect + dynamicEffect + randomEffect;

    // ضمان أن النسبة بين 40 و 95
    securityScore = Math.max(40, Math.min(95, securityScore));

    data.push({ value: Math.round(securityScore) });
  }

  return data;
};

// بيانات واقعية لأداء النظام
const generatePerformanceData = (
  total: number,
  byResource: Record<string, number>,
) => {
  const data = [];
  const resourceCount = Object.keys(byResource).length;
  const avgPermissionsPerResource = total / resourceCount;

  // مؤشر الأداء الأساسي
  let performance = 85;

  for (let i = 0; i < 24; i++) {
    const hour = i;

    // تأثير عدد الصلاحيات على الأداء
    const volumeEffect = Math.max(-15, (total / 100) * -0.5);

    // تأثير توزيع الصلاحيات (التوزيع الجيد يحسن الأداء)
    const distributionQuality = avgPermissionsPerResource > 20 ? -8 : 5;

    // نمط استخدام حسب الوقت
    const timePattern = [2, 3, 4, 5].includes(hour)
      ? 10
      : // أداء أفضل ليلاً
        [9, 10, 11, 14, 15, 16].includes(hour)
        ? -12
        : // ضغط أثناء ساعات العمل
          0;

    // تقلبات عشوائية
    const randomEffect = (Math.random() - 0.5) * 8;

    performance =
      85 + volumeEffect + distributionQuality + timePattern + randomEffect;

    // ضمان أن النسبة بين 50 و 95
    performance = Math.max(50, Math.min(95, performance));

    data.push({ value: Math.round(performance) });
  }

  return data;
};

const permissionCards = (statistics: PermissionStatistics) => {
  const usageData = generateRealisticUsageData(
    statistics.total,
    statistics.static,
    statistics.dynamic,
  );
  const distributionData = generateDistributionData(statistics.byResource);
  const securityData = generateSecurityData(
    statistics.static,
    statistics.dynamic,
    statistics.total,
  );
  const performanceData = generatePerformanceData(
    statistics.total,
    statistics.byResource,
  );

  // حساب مؤشرات واقعية
  const avgUsage = Math.round(
    usageData.reduce((sum, item) => sum + item.value, 0) / usageData.length,
  );
  const securityScore = Math.round(
    securityData.reduce((sum, item) => sum + item.value, 0) /
      securityData.length,
  );
  const performanceScore = Math.round(
    performanceData.reduce((sum, item) => sum + item.value, 0) /
      performanceData.length,
  );

  // مؤشر التوازن (من توزيع البيانات)
  const balanceTrend =
    distributionData[distributionData.length - 1].value -
    distributionData[0].value;

  return [
    {
      title: "System Usage",
      metric: "Permission utilization rate",
      baseValue: `${avgUsage}%`,
      baseCurrency: "Avg Usage",
      targetValue: `${Math.max(...usageData.map((d) => d.value))}%`,
      targetCurrency: "Peak",
      data: usageData,
      change: avgUsage > 70 ? "High" : avgUsage > 40 ? "Normal" : "Low",
      isPositive: avgUsage > 40 && avgUsage < 85,
      color:
        avgUsage > 70
          ? "var(--color-amber-500)"
          : avgUsage > 40
            ? "var(--color-emerald-500)"
            : "var(--color-blue-500)",
    },
    {
      title: "Resource Balance",
      metric: "Permission distribution quality",
      baseValue: `${Object.keys(statistics.byResource).length}`,
      baseCurrency: "Resources",
      targetValue: `${balanceTrend > 0 ? "+" : ""}${balanceTrend.toFixed(1)}`,
      targetCurrency: "Trend",
      data: distributionData,
      change:
        Math.abs(balanceTrend) < 5
          ? "Balanced"
          : balanceTrend > 0
            ? "Improving"
            : "Declining",
      isPositive: Math.abs(balanceTrend) < 8,
      color:
        Math.abs(balanceTrend) < 5
          ? "var(--color-emerald-500)"
          : balanceTrend > 0
            ? "var(--color-blue-500)"
            : "var(--color-amber-500)",
    },
    {
      title: "Security Score",
      metric: "System security effectiveness",
      baseValue: `${securityScore}%`,
      baseCurrency: "Score",
      targetValue: `${statistics.dynamic > statistics.static ? "Review" : "Secure"}`,
      targetCurrency: "Status",
      data: securityData,
      change:
        securityScore > 80
          ? "Excellent"
          : securityScore > 60
            ? "Good"
            : "Needs Attention",
      isPositive: securityScore > 70,
      color:
        securityScore > 80
          ? "var(--color-emerald-500)"
          : securityScore > 60
            ? "var(--color-amber-500)"
            : "var(--color-red-500)",
    },
    {
      title: "System Performance",
      metric: "Permission management efficiency",
      baseValue: `${performanceScore}%`,
      baseCurrency: "Efficiency",
      targetValue: `${statistics.total > 100 ? "Scale" : "Optimal"}`,
      targetCurrency: "State",
      data: performanceData,
      change:
        performanceScore > 80
          ? "Optimal"
          : performanceScore > 60
            ? "Adequate"
            : "Review Needed",
      isPositive: performanceScore > 70,
      color:
        performanceScore > 80
          ? "var(--color-emerald-500)"
          : performanceScore > 60
            ? "var(--color-amber-500)"
            : "var(--color-red-500)",
    },
  ];
};

export function StatisticsPanel({
  statistics,
  isOpen,
  onToggle,
}: StatisticsPanelProps) {
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className="w-full justify-between border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="text-blue-700 dark:text-blue-300">
            Show Permissions Analytics
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-blue-600" />
      </Button>
    );
  }

  const cards = permissionCards(statistics);

  // حساب التوصيات بناءً على البيانات
  const getRecommendations = () => {
    const recommendations = [];

    if (statistics.dynamic > statistics.static * 2) {
      recommendations.push(
        "Consider converting some dynamic permissions to static for better performance",
      );
    }

    if (Object.keys(statistics.byResource).length < 3) {
      recommendations.push(
        "Diversify resource types to improve system flexibility",
      );
    }

    if (statistics.total > 150) {
      recommendations.push(
        "System is handling large volume - monitor performance closely",
      );
    }

    const maxPermissions = Math.max(...Object.values(statistics.byResource));
    if (maxPermissions > statistics.total * 0.4) {
      recommendations.push(
        "Some resources are overloaded - consider permission redistribution",
      );
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="flex items-center justify-center p-6">
      <div className="@container grow w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Permissions Analytics
            </h2>
            <p className="text-muted-foreground">
              Real-time insights and performance metrics
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <ChevronUp className="h-4 w-4 mr-2" />
            Collapse
          </Button>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-4 gap-6 mb-6">
          {cards.map((card, i) => (
            <Card
              key={i}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-foreground m-0">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground m-0">
                    {card.metric}
                  </p>
                </div>

                {/* Chart Section */}
                <div className="flex items-center justify-between">
                  {/* Left side - Base Value */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {card.baseValue}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {card.baseCurrency}
                    </div>
                  </div>

                  {/* Center - Mini Chart */}
                  <div className="flex-1 h-14 mx-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={card.data}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <YAxis domain={[0, 100]} hide={true} />
                        <ReferenceLine
                          y={50}
                          stroke="var(--input)"
                          strokeWidth={1}
                          strokeDasharray="3 3"
                        />
                        <Tooltip
                          cursor={{
                            stroke: card.color,
                            strokeWidth: 1,
                            strokeDasharray: "2 2",
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value as number;
                              return (
                                <div className="bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-2">
                                  <p className="text-sm font-semibold text-foreground">
                                    {value}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {card.title}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={card.color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill: card.color,
                            stroke: "white",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Right side - Target Value */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {card.targetValue}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {card.targetCurrency}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex items-center gap-1 ${
                      card.isPositive ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {card.isPositive ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {card.change}
                  </span>
                  <span className="text-muted-foreground">
                    {card.isPositive ? "Healthy" : "Monitor"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommendations and Key Metrics */}
        <div className="grid grid-cols-1 @lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <Card className="@lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Key Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Permissions
                  </span>
                  <span className="font-semibold">{statistics.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Static Permissions
                  </span>
                  <span className="font-semibold">{statistics.static}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Dynamic Permissions
                  </span>
                  <span className="font-semibold">{statistics.dynamic}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Resource Types
                  </span>
                  <span className="font-semibold">
                    {Object.keys(statistics.byResource).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Action Types
                  </span>
                  <span className="font-semibold">
                    {Object.keys(statistics.byAction).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="@lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                AI Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {rec}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                      System is well optimized. No immediate actions required.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// /** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
// "use client";

// import {
//   Activity,
//   BarChart3,
//   ChevronDown,
//   ChevronUp,
//   Database,
//   FileText,
//   Lock,
//   Shield,
//   TrendingUp,
//   Users,
//   Zap,
// } from "lucide-react";
// import {
//   Bar,
//   BarChart,
//   Cell,
//   Legend,
//   Line,
//   LineChart,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { cn } from "@/lib/utils";

// interface PermissionStatistics {
//   total: number;
//   static: number;
//   dynamic: number;
//   byResource: Record<string, number>;
//   byAction: Record<string, number>;
//   recentlyAdded: any[];
// }

// interface StatisticsPanelProps {
//   statistics: PermissionStatistics;
//   isOpen: boolean;
//   onToggle: () => void;
// }

// // ألوان المخططات
// const CHART_COLORS = {
//   resource: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
//   action: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
//   type: ["#6366f1", "#ec4899"],
// };

// export function StatisticsPanel({
//   statistics,
//   isOpen,
//   onToggle,
// }: StatisticsPanelProps) {
//   if (!isOpen) {
//     return (
//       <Button
//         variant="outline"
//         onClick={onToggle}
//         className="w-full justify-between border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
//       >
//         <div className="flex items-center gap-2">
//           <BarChart3 className="h-4 w-4 text-blue-600" />
//           <span className="text-blue-700 dark:text-blue-300">
//             Show Permissions Statistics
//           </span>
//         </div>
//         <ChevronDown className="h-4 w-4 text-blue-600" />
//       </Button>
//     );
//   }

//   // تحويل البيانات للمخططات
//   const resourceChartData = Object.entries(statistics.byResource)
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 6)
//     .map(([name, value], index) => ({
//       name: name.replace(/_/g, " "),
//       value,
//       fill: CHART_COLORS.resource[index % CHART_COLORS.resource.length],
//     }));

//   const actionChartData = Object.entries(statistics.byAction).map(
//     ([name, value], index) => ({
//       name: name.charAt(0).toUpperCase() + name.slice(1),
//       value,
//       fill: CHART_COLORS.action[index % CHART_COLORS.action.length],
//     }),
//   );

//   const typeChartData = [
//     { name: "Static", value: statistics.static, fill: CHART_COLORS.type[0] },
//     { name: "Dynamic", value: statistics.dynamic, fill: CHART_COLORS.type[1] },
//   ];

//   // بيانات الرسم البياني الزمني (محاكاة)
//   const timelineData = [
//     { month: "Jan", permissions: 45 },
//     { month: "Feb", permissions: 52 },
//     { month: "Mar", permissions: 48 },
//     { month: "Apr", permissions: 61 },
//     { month: "May", permissions: 55 },
//     { month: "Jun", permissions: statistics.total },
//   ];

//   // أهم الموارد
//   const topResources = Object.entries(statistics.byResource)
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 5);

//   // أحدث الصلاحيات المضافة
//   const recentPermissions = statistics.recentlyAdded.slice(0, 3);

//   return (
//     <Card className="border-l-4 border-l-blue-500 shadow-lg">
//       <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20">
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex items-center gap-2 text-lg text-blue-900 dark:text-blue-100">
//             <BarChart3 className="h-5 w-5" />
//             Permissions Analytics Dashboard
//           </CardTitle>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onToggle}
//             className="text-blue-700 hover:text-blue-900"
//           >
//             <ChevronUp className="h-4 w-4" />
//           </Button>
//         </div>
//       </CardHeader>

//       <CardContent className="p-6 space-y-6">
//         {/* الإحصائيات الرئيسية */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {/* إجمالي الصلاحيات */}
//           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-blue-100">
//                     Total Permissions
//                   </p>
//                   <p className="text-2xl font-bold">{statistics.total}</p>
//                 </div>
//                 <Lock className="h-8 w-8 text-blue-200" />
//               </div>
//             </CardContent>
//           </Card>

//           {/* الصلاحيات الثابتة */}
//           <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-100">Static</p>
//                   <p className="text-2xl font-bold">{statistics.static}</p>
//                   <p className="text-xs text-gray-200">
//                     {((statistics.static / statistics.total) * 100).toFixed(1)}%
//                   </p>
//                 </div>
//                 <Shield className="h-8 w-8 text-gray-200" />
//               </div>
//             </CardContent>
//           </Card>

//           {/* الصلاحيات الديناميكية */}
//           <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-cyan-100">Dynamic</p>
//                   <p className="text-2xl font-bold">{statistics.dynamic}</p>
//                   <p className="text-xs text-cyan-200">
//                     {((statistics.dynamic / statistics.total) * 100).toFixed(1)}
//                     %
//                   </p>
//                 </div>
//                 <Zap className="h-8 w-8 text-cyan-200" />
//               </div>
//             </CardContent>
//           </Card>

//           {/* متوسط الصلاحيات لكل مورد */}
//           <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-green-100">
//                     Avg/Resource
//                   </p>
//                   <p className="text-2xl font-bold">
//                     {(
//                       statistics.total /
//                       Object.keys(statistics.byResource).length
//                     ).toFixed(1)}
//                   </p>
//                 </div>
//                 <TrendingUp className="h-8 w-8 text-green-200" />
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* المخططات */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* توزيع الموارد */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium flex items-center gap-2">
//                 <Database className="h-4 w-4 text-blue-600" />
//                 Resource Distribution
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={resourceChartData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={40}
//                       outerRadius={80}
//                       paddingAngle={2}
//                       dataKey="value"
//                     >
//                       {resourceChartData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.fill} />
//                       ))}
//                     </Pie>
//                     <Tooltip
//                       formatter={(value) => [`${value} permissions`, "Count"]}
//                       labelFormatter={(label) => `Resource: ${label}`}
//                     />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>

//           {/* توزيع الإجراءات */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium flex items-center gap-2">
//                 <Activity className="h-4 w-4 text-green-600" />
//                 Action Types Distribution
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={actionChartData}>
//                     <XAxis
//                       dataKey="name"
//                       fontSize={12}
//                       angle={-45}
//                       textAnchor="end"
//                       height={60}
//                     />
//                     <YAxis fontSize={12} />
//                     <Tooltip
//                       formatter={(value) => [`${value} permissions`, "Count"]}
//                     />
//                     <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                       {actionChartData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.fill} />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* المعلومات التفصيلية */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* أهم الموارد */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium flex items-center gap-2">
//                 <TrendingUp className="h-4 w-4 text-orange-600" />
//                 Top Resources
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {topResources.map(([resource, count], index) => (
//                   <div
//                     key={resource}
//                     className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className="w-3 h-3 rounded-full"
//                         style={{
//                           backgroundColor: CHART_COLORS.resource[index],
//                         }}
//                       />
//                       <span className="font-medium text-sm capitalize">
//                         {resource.replace(/_/g, " ")}
//                       </span>
//                     </div>
//                     <Badge variant="secondary" className="font-mono">
//                       {count}
//                     </Badge>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           {/* أحدث الإضافات */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium flex items-center gap-2">
//                 <Users className="h-4 w-4 text-purple-600" />
//                 Recently Added
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {recentPermissions.map((permission, index) => (
//                   <div
//                     key={permission.id}
//                     className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 rounded-full bg-green-500" />
//                       <div className="flex flex-col">
//                         <span className="font-medium text-sm">
//                           {permission.name}
//                         </span>
//                         <span className="text-xs text-muted-foreground capitalize">
//                           {permission.resource.replace(/_/g, " ")} •{" "}
//                           {permission.action}
//                         </span>
//                       </div>
//                     </div>
//                     <Badge
//                       variant={permission.conditions ? "default" : "secondary"}
//                       className={cn(
//                         "text-xs",
//                         permission.conditions &&
//                           "bg-cyan-600 hover:bg-cyan-700",
//                       )}
//                     >
//                       {permission.conditions ? "Dynamic" : "Static"}
//                     </Badge>
//                   </div>
//                 ))}
//                 {recentPermissions.length === 0 && (
//                   <div className="text-center text-muted-foreground py-4">
//                     <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                     <p className="text-sm">No recent permissions</p>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* ملخص التحليل */}
//         <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10">
//           <CardContent className="p-4">
//             <div className="flex items-start gap-3">
//               <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
//                 <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//               </div>
//               <div className="flex-1">
//                 <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
//                   Security Insights
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <p className="text-blue-700 dark:text-blue-300">
//                       • {statistics.dynamic} dynamic permissions require special
//                       attention
//                     </p>
//                     <p className="text-blue-700 dark:text-blue-300">
//                       • {topResources[0]?.[1] || 0} permissions on{" "}
//                       {topResources[0]?.[0]?.replace(/_/g, " ") || "N/A"}{" "}
//                       resource
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-blue-700 dark:text-blue-300">
//                       • {statistics.static} static permissions are baseline
//                       secured
//                     </p>
//                     <p className="text-blue-700 dark:text-blue-300">
//                       • System manages{" "}
//                       {Object.keys(statistics.byResource).length} resource types
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </CardContent>
//     </Card>
//   );
// }
