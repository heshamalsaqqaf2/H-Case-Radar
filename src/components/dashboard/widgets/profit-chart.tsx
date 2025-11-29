"use client";

import { ScifiCorner, ScifiScanline } from "@/components/dashboard/shared/scifi-decorations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfitChart() {
  return (
    <Card className="scifi-card h-full flex flex-col relative overflow-hidden group">
      <ScifiScanline />
      <ScifiCorner position="top-left" />
      <ScifiCorner position="top-right" />
      <ScifiCorner position="bottom-left" />
      <ScifiCorner position="bottom-right" />

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-base font-semibold text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
          Profit Analysis
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-between p-6 relative z-10">
        {/* Gauge Chart */}
        <div className="relative w-full max-w-[220px] aspect-[2/1] flex items-end justify-center mb-4">
          {/** biome-ignore lint/a11y/noSvgWithoutTitle: <> */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 110">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#00f2ff" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Progress Arc (92%) */}
            {/* 92% of 180 degrees is ~165.6 degrees. */}
            <path
              d="M 20 100 A 80 80 0 0 1 175 80"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 8px rgba(0, 242, 255, 0.5))" }}
              strokeDasharray="251"
              strokeDashoffset="20"
              className="animate-[dash_1.5s_ease-out_forwards]"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute bottom-0 flex flex-col items-center mb-2">
            <div className="text-3xl font-bold text-white drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]">
              92%
            </div>
            <div className="text-xs text-muted-foreground font-medium tracking-wider">Profit</div>
          </div>
        </div>

        {/* Stats Below Gauge */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Income</span>
            <div className="text-right">
              <span className="block font-bold text-white">$47,289</span>
              <span className="text-[10px] text-emerald-400">↑ 21%</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[75%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expenses</span>
            <div className="text-right">
              <span className="block font-bold text-white">$25,783</span>
              <span className="text-[10px] text-rose-400">↓ 12%</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[45%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
