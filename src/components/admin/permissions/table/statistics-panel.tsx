/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import {
  Activity,
  AlertTriangle,
  BarChart,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  FileText,
  Lock,
  PieChart,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        className="w-full justify-between border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:border-blue-800 dark:from-blue-950/20 dark:to-cyan-950/20 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            Show Advanced Analytics
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-blue-600" />
      </Button>
    );
  }

  // حساب المؤشرات
  const staticPercentage = Math.round(
    (statistics.static / statistics.total) * 100,
  );
  const dynamicPercentage = Math.round(
    (statistics.dynamic / statistics.total) * 100,
  );
  const resourcesCount = Object.keys(statistics.byResource).length;
  const actionsCount = Object.keys(statistics.byAction).length;
  const avgPermissionsPerResource = Math.round(
    statistics.total / resourcesCount,
  );

  // البطاقات الإحصائية المحسنة
  const statCards = [
    {
      title: "Total Permissions",
      value: statistics.total,
      description: "Across all resources",
      icon: Lock,
      trend: "+12%",
      trendPositive: true,
      color: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-200",
      bgColor: "bg-blue-500",
      detail: `${resourcesCount} resources`,
    },
    {
      title: "Static Permissions",
      value: statistics.static,
      description: "Fixed access rules",
      icon: Shield,
      trend: `${staticPercentage}%`,
      trendPositive: staticPercentage > 70,
      color: "from-emerald-500 to-green-500",
      iconColor: "text-emerald-200",
      bgColor: "bg-emerald-500",
      detail: "Core security layer",
    },
    {
      title: "Dynamic Permissions",
      value: statistics.dynamic,
      description: "Conditional access",
      icon: Zap,
      trend: `${dynamicPercentage}%`,
      trendPositive: dynamicPercentage < 30,
      color: "from-purple-500 to-pink-500",
      iconColor: "text-purple-200",
      bgColor: "bg-purple-500",
      detail: "Flexible rules",
    },
    {
      title: "Resource Types",
      value: resourcesCount,
      description: "Different categories",
      icon: Database,
      trend: `${avgPermissionsPerResource} avg`,
      trendPositive: true,
      color: "from-orange-500 to-red-500",
      iconColor: "text-orange-200",
      bgColor: "bg-orange-500",
      detail: `${actionsCount} action types`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 🎯 البطاقات الإحصائية المحسنة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className="group relative overfl    ow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {/* تأثير الخلفية المتدرج */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
            />
            {/* تأثير إشعاعي */}
            <div
              className={`absolute -right-10 -top-10 w-20 h-20 rounded-full ${card.bgColor} opacity-20 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500`}
            />

            <CardContent className="relative p-6 z-10">
              <div className="flex items-start justify-between">
                {/* المحتوى الرئيسي */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                    <span className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </span>
                  </div>

                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {card.value}
                    </span>
                    <Badge
                      variant={card.trendPositive ? "default" : "secondary"}
                      className={`
                        ${
                          card.trendPositive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                        } font-semibold text-xs
                      `}
                    >
                      {card.trend}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {card.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs">
                    <div className={`w-2 h-2 rounded-full ${card.bgColor}`} />
                    <span className="text-muted-foreground font-medium">
                      {card.detail}
                    </span>
                  </div>
                </div>

                {/* أيقونة دائرية */}
                <div
                  className={`p-3 rounded-2xl ${card.bgColor} bg-gradient-to-br ${card.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* شريط التقدم (للبطاقات ذات النسب) */}
              {(card.title === "Static Permissions" ||
                card.title === "Dynamic Permissions") && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Usage</span>
                    <span>{card.trend}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${card.color} transition-all duration-1000 ease-out`}
                      style={{
                        width: card.trend.replace("%", "") + "%",
                        animation: "growWidth 1s ease-out",
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 📊 بطاقات التحليل الإضافية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* كفاءة النظام */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-xl dark:bg-green-900/30">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  System Health
                </p>
                <p className="text-xs text-muted-foreground">Overall status</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant="default"
                className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Optimal
              </Badge>
              <div className="text-2xl font-bold text-green-600">95%</div>
            </div>
          </CardContent>
        </Card>

        {/* أداء الأمان */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-xl dark:bg-blue-900/30">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Security Score
                </p>
                <p className="text-xs text-muted-foreground">
                  Protection level
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant="default"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                Excellent
              </Badge>
              <div className="text-2xl font-bold text-blue-600">93%</div>
            </div>
          </CardContent>
        </Card>

        {/* كفاءة الأداء */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl dark:bg-purple-900/30">
                <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Performance
                </p>
                <p className="text-xs text-muted-foreground">Efficiency rate</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant="default"
                className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              >
                Optimal
              </Badge>
              <div className="text-2xl font-bold text-purple-600">88%</div>
            </div>
          </CardContent>
        </Card>

        {/* توازن الموارد */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl dark:bg-amber-900/30">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Resource Balance
                </p>
                <p className="text-xs text-muted-foreground">
                  Distribution quality
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant="default"
                className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              >
                Balanced
              </Badge>
              <div className="text-2xl font-bold text-amber-600">8</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🎨 إضافة أنماط CSS للحركات */}
      <style jsx>{`
        @keyframes growWidth {
          from { width: 0%; }
          to { width: var(--target-width); }
        }
      `}</style>
    </div>
  );
}
