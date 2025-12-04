// components/luxury-stats-cards.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { motion } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Crown,
  DollarSign,
  Gem,
  Monitor,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EffectCard } from "./effect-card";

interface LuxuryStatsCardProps {
  title: string;
  value: string;
  delta: number;
  lastMonth: string;
  icon: React.ReactNode;
  accentColor: string;
  delay?: number;
}

const LuxuryStatsCard = ({
  title,
  value,
  delta,
  lastMonth,
  icon,
  accentColor,
  delay = 0,
}: LuxuryStatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: delay * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group"
    >
      {/* التأثيرات الخلفية الفاخرة */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />

      {/* الحدود المتلألئة */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${accentColor} p-[1px] opacity-70`}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent blur-sm" />
      </div>

      <Card
        className={cn(
          "relative rounded-3xl border-0 backdrop-blur-2xl overflow-hidden",
          "bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-950/95",
          "shadow-2xl shadow-black/50",
          "transition-all duration-700 group-hover:shadow-3xl",
        )}
      >
        {/* تأثير الجواهر */}
        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
          <Gem className="h-6 w-6 text-white" />
        </div>

        {/* الجسيمات المتلألئة */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatType: "loop",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <CardHeader className="pb-4 pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-light tracking-widest text-white/80 uppercase">
              {title}
            </CardTitle>
            <motion.div
              className={cn(
                "p-3 rounded-2xl backdrop-blur-sm border border-white/10",
                "bg-gradient-to-br from-white/5 to-white/10",
                "shadow-lg",
              )}
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <motion.div
                className="text-4xl font-bold text-white tracking-tight"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay * 0.1 + 0.3, type: "spring", stiffness: 200 }}
              >
                <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-2xl">
                  {value}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay * 0.1 + 0.5 }}
              >
                <Badge
                  className={cn(
                    "gap-2 font-semibold border-0 backdrop-blur-sm px-3 py-1.5 rounded-xl",
                    "transition-all duration-300 group-hover:shadow-lg",
                    delta > 0
                      ? "bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                      : "bg-gradient-to-r from-rose-500/30 to-rose-600/30 text-rose-300 border border-rose-500/30",
                  )}
                >
                  {delta > 0 ? (
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowUpIcon className="h-3.5 w-3.5" />
                    </motion.div>
                  ) : (
                    <ArrowDownIcon className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(delta)}%
                </Badge>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="pt-4 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay * 0.1 + 0.7 }}
          >
            <p className="text-xs text-white/60 tracking-wide font-light">
              أخر 30 يوما: <span className="font-medium text-white/90">{lastMonth}</span>
            </p>
          </motion.div>
        </CardContent>

        {/* تأثير اللمعة عند التمرير */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Card>
    </motion.div>
  );
};

export function LuxuryStatisticsCards() {
  const stats = [
    {
      title: "المستخدمين النشطين",
      value: "2,847",
      delta: 12.5,
      lastMonth: "2,540",
      icon: <Users className="h-6 w-6 text-blue-300" />,
      accentColor: "from-blue-400 via-cyan-400 to-blue-600",
    },
    {
      title: "الإيرادات",
      value: "$48.2K",
      delta: 8.3,
      lastMonth: "$44.5K",
      icon: <DollarSign className="h-6 w-6 text-emerald-300" />,
      accentColor: "from-emerald-400 via-teal-400 to-emerald-600",
    },
    {
      title: "معدل التحويل",
      value: "64.7%",
      delta: -3.2,
      lastMonth: "67.9%",
      icon: <TrendingUp className="h-6 w-6 text-amber-300" />,
      accentColor: "from-amber-400 via-orange-400 to-amber-600",
    },
    {
      title: "الجلسات النشطة",
      value: "12.4K",
      delta: 15.7,
      lastMonth: "10.7K",
      icon: <Monitor className="h-6 w-6 text-purple-300" />,
      accentColor: "from-purple-400 via-pink-400 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black p-8">
      {/* الهيدر الفاخر */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="h-8 w-8 text-amber-400" />
          <h1 className="text-4xl font-light tracking-widest text-white/90">لوحة التحكم الفاخرة</h1>
          <Sparkles className="h-8 w-8 text-amber-400" />
        </div>
        <p className="text-white/60 text-sm tracking-wide font-light">
          إحصائيات وأداء متقدمة بتصميم فاخر
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {stats.map((stat, index) => (
          <LuxuryStatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            delta={stat.delta}
            lastMonth={stat.lastMonth}
            icon={stat.icon}
            accentColor={stat.accentColor}
            delay={index}
          />
        ))}
        <EffectCard />
      </div>

      {/* الفوتر الفاخر */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white/40 text-xs tracking-widest font-light">
          © 2024 نظام الإدارة الفاخر • تم التحديث اليوم في 14:30
        </p>
      </motion.div>
    </div>
  );
}
