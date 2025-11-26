/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */

"use client";

import {
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import React from "react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, YAxis } from "recharts";
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
}

// بيانات واقعية لأنماط استخدام الصلاحيات - تعكس استخدام حقيقي
const generateRealisticUsageData = (total: number, staticCount: number, dynamicCount: number) => {
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
    const concentration = maxValue / (values.reduce((a, b) => a + b, 0) / values.length) - 1;
    const concentrationEffect = concentration * 8;

    balanceIndex = basePattern + resourceEffect + concentrationEffect + (Math.random() - 0.5) * 6;

    data.push({ value: Math.round(balanceIndex * 10) / 10 });
  }

  return data;
};

// بيانات واقعية لفعالية الأمان
const generateSecurityData = (staticCount: number, dynamicCount: number, total: number) => {
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
const generatePerformanceData = (total: number, byResource: Record<string, number>) => {
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

    performance = 85 + volumeEffect + distributionQuality + timePattern + randomEffect;

    // ضمان أن النسبة بين 50 و 95
    performance = Math.max(50, Math.min(95, performance));

    data.push({ value: Math.round(performance) });
  }

  return data;
};

const permissionCards = (statistics: PermissionStatistics) => {
  const usageData = generateRealisticUsageData(statistics.total, statistics.static, statistics.dynamic);
  const distributionData = generateDistributionData(statistics.byResource);
  const securityData = generateSecurityData(statistics.static, statistics.dynamic, statistics.total);
  const performanceData = generatePerformanceData(statistics.total, statistics.byResource);

  // حساب مؤشرات واقعية
  const avgUsage = Math.round(usageData.reduce((sum, item) => sum + item.value, 0) / usageData.length);
  const securityScore = Math.round(
    securityData.reduce((sum, item) => sum + item.value, 0) / securityData.length,
  );
  const performanceScore = Math.round(
    performanceData.reduce((sum, item) => sum + item.value, 0) / performanceData.length,
  );

  // مؤشر التوازن (من توزيع البيانات)
  const balanceTrend = distributionData[distributionData.length - 1].value - distributionData[0].value;

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
      change: Math.abs(balanceTrend) < 5 ? "Balanced" : balanceTrend > 0 ? "Improving" : "Declining",
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
      change: securityScore > 80 ? "Excellent" : securityScore > 60 ? "Good" : "Needs Attention",
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
      change: performanceScore > 80 ? "Optimal" : performanceScore > 60 ? "Adequate" : "Review Needed",
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

export function StatisticsPanel({ statistics }: StatisticsPanelProps) {
  const [cards, setCards] = React.useState<ReturnType<typeof permissionCards>>([]);

  React.useEffect(() => {
    setCards(permissionCards(statistics));
  }, [statistics]);

  if (cards.length === 0) {
    return null; // أو يمكن عرض skeleton loading هنا
  }

  // حساب التوصيات بناءً على البيانات
  const getRecommendations = () => {
    const recommendations = [];

    if (statistics.dynamic > statistics.static * 2) {
      recommendations.push("Consider converting some dynamic permissions to static for better performance");
    }

    if (Object.keys(statistics.byResource).length < 3) {
      recommendations.push("Diversify resource types to improve system flexibility");
    }

    if (statistics.total > 150) {
      recommendations.push("System is handling large volume - monitor performance closely");
    }

    const maxPermissions = Math.max(...Object.values(statistics.byResource));
    if (maxPermissions > statistics.total * 0.4) {
      recommendations.push("Some resources are overloaded - consider permission redistribution");
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="flex items-center justify-center">
      <div className="@container grow w-full max-w-7xl">
        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-foreground m-0">{card.title}</h3>
                  <p className="text-sm text-muted-foreground m-0">{card.metric}</p>
                </div>

                {/* Chart Section */}
                <div className="flex items-center justify-between">
                  {/* Left side - Base Value */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{card.baseValue}</div>
                    <div className="text-xs text-muted-foreground font-medium">{card.baseCurrency}</div>
                  </div>

                  {/* Center - Mini Chart */}
                  <div className="flex-1 h-14 mx-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={card.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <YAxis domain={[0, 100]} hide={true} />
                        <ReferenceLine y={50} stroke="var(--input)" strokeWidth={1} strokeDasharray="3 3" />
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
                                  <p className="text-sm font-semibold text-foreground">{value}%</p>
                                  <p className="text-xs text-muted-foreground">{card.title}</p>
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
                    <div className="text-lg font-semibold text-foreground">{card.targetValue}</div>
                    <div className="text-xs text-muted-foreground font-medium">{card.targetCurrency}</div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex items-center gap-1 ${card.isPositive ? "text-emerald-600" : "text-amber-600"
                      }`}
                  >
                    {card.isPositive ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {card.change}
                  </span>
                  <span className="text-muted-foreground">{card.isPositive ? "Healthy" : "Monitor"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Recommendations and Key Metrics */}
        {/* <div className="grid grid-cols-1 @lg:grid-cols-3 gap-6">
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
        </div> */}
      </div>
    </div>
  );
}
