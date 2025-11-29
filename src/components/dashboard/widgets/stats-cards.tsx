"use client";

import { IconAlertCircle, IconEye, IconLock, IconUser } from "@tabler/icons-react";

const stats = [
  {
    label: "إجمالي المستخدمين",
    value: "9",
    change: "0.29%",
    trend: "up",
    icon: IconUser,
    progress: 48,
    color: "#ef4444", // rose
  },
  {
    label: "إجمالي البلاغات",
    value: "103",
    change: "1.25%",
    trend: "up",
    icon: IconAlertCircle,
    progress: 77,
    color: "#3b82f6", // Blue
  },
  {
    label: "إجمالي الأدوار",
    value: "12",
    change: "0.05%",
    trend: "down",
    icon: IconLock,
    progress: 12,
    color: "#f59e0b", //yellow 
  },
  {
    label: "إجمالي الصلاحيات",
    value: "165",
    change: "0.18%",
    trend: "up",
    icon: IconEye,
    progress: 25,
    color: "#8b5cf6", // Purple
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index.toString()} className="relative group h-full bg-[#050b14]/80 border rounded-lg border-primary/20 overflow-hidden">
          {/* Vertical Gradient Glow Effect - Top to Bottom */}
          <div className="absolute inset-0 bg-linear-to-b from-emerald-500/30 via-emerald-600/5 to-transparent opacity-50 group-hover:opacity-40 transition-opacity duration-500" />

          {/* Subtle Corner Brackets with Glow */}
          <div className="absolute top-0 right-0 w-4 h-9 border-t border-r border-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 242, 255, 0.9))' }} />
          <div className="absolute bottom-0 left-0 w-4 h-8 border-b border-l border-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 242, 255, 0.9))' }} />
          {/* <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/80" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 242, 255, 1.9))' }} /> */}
          {/* <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/20" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 242, 255, 1.9))' }} /> */}

          {/* Top and Bottom Bracket Borders */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[2px] bg-linear-to-l from-emerald-500 to-lime-500 shadow-[0_0_10px_rgba(0,242,255,0.8)] z-20" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/5 h-[2px] bg-linear-to-l from-lime-500 to-emerald-500 shadow-[0_0_10px_rgba(0,242,255,0.8)] z-20" />

          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-size-[20px_20px]" />

          <div className="p-6 relative z-10 flex flex-col h-full">
            {/* Top Section: Icon + Text */}
            <div className="flex items-center gap-4 mb-6">
              {/* Icon Box */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                <stat.icon className="w-6 h-6 text-primary" style={{ color: stat.color }} />
              </div>

              {/* Text Info */}
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                <div className={`text-[10px] mt-1 font-bold flex items-center gap-1 ${stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span>{stat.trend === 'up' ? '↑' : '↓'} {stat.change}</span>
                  <span className="text-muted-foreground/60 font-normal">This Month</span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Circular Progress */}
            <div className="flex justify-center mt-auto">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <title>Progress</title>
                  {/* Dashed Outer Ring */}
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke={stat.color}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray="4 4"
                    className="text-muted/20"
                  />

                  {/* Inner Progress Track */}
                  <circle
                    cx="40"
                    cy="40"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-muted/10"
                  />

                  {/* Active Progress */}
                  <circle
                    cx="40"
                    cy="40"
                    r="28"
                    stroke={stat.color}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={175}
                    strokeDashoffset={175 - (175 * stat.progress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 4px ${stat.color})` }}
                  />
                </svg>
                <span className="absolute text-sm font-bold text-white">
                  {stat.progress}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
