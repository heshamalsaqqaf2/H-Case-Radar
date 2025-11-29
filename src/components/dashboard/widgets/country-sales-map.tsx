/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <> */
"use client";

import { ScifiCorner, ScifiScanline } from "@/components/dashboard/shared/scifi-decorations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simple SVG World Map with specific dots
export function CountrySalesMap() {
  return (
    <Card className="scifi-card h-full relative overflow-hidden group">
      <ScifiScanline />
      <ScifiCorner position="top-left" />
      <ScifiCorner position="top-right" />
      <ScifiCorner position="bottom-left" />
      <ScifiCorner position="bottom-right" />

      <CardHeader className="relative z-10">
        <CardTitle className="text-base font-semibold text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
          Top Country Sales
        </CardTitle>
      </CardHeader>
      <CardContent className="relative h-[300px] flex items-center justify-center overflow-hidden z-10">
        {/* Map Background */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.1),transparent_70%)]" />

        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full text-[#1e293b] fill-current drop-shadow-[0_0_2px_rgba(0,242,255,0.1)]"
        >
          {/* Simplified World Map Path - Placeholder for visual representation */}
          <path
            d="M150,150 Q200,100 250,150 T350,150 T450,150 T550,150 T650,150 T750,150 T850,150"
            fill="none"
            stroke="none"
          />
          {/* Using a background image for the map is often better for complex shapes if we don't have the path data. 
               However, to be self-contained, I'll use a very simplified abstract representation or dots.
               Actually, for a "Top Country Sales" map, let's use a background image of a world map if possible, 
               or draw a few key continents. 
               
               Since I can't easily import a huge SVG path here without bloating, 
               I will simulate the look with a dotted grid and specific highlighted points which looks very "SciFi".
           */}
          {/* Grid Lines for SciFi feel */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 242, 255, 0.05)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Continents (Abstract Shapes) */}
          <path d="M200,120 L300,100 L350,180 L250,250 Z" className="fill-slate-800/50 stroke-slate-700" />{" "}
          {/* North America */}
          <path d="M280,260 L350,260 L320,400 L280,350 Z" className="fill-slate-800/50 stroke-slate-700" />{" "}
          {/* South America */}
          <path
            d="M450,100 L600,80 L650,200 L500,250 L450,180 Z"
            className="fill-slate-800/50 stroke-slate-700"
          />{" "}
          {/* Europe/Asia */}
          <path d="M480,260 L580,260 L550,380 L480,350 Z" className="fill-slate-800/50 stroke-slate-700" />{" "}
          {/* Africa */}
          <path d="M700,250 L800,250 L780,350 L720,320 Z" className="fill-slate-800/50 stroke-slate-700" />{" "}
          {/* Australia */}
          {/* Connection Lines */}
          <path
            d="M250,150 L400,120 L550,180 L750,150"
            fill="none"
            stroke="#00f2ff"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-50 animate-pulse"
          />
          {/* Hotspots */}
          <g className="cursor-pointer hover:scale-110 transition-transform">
            <circle cx="250" cy="150" r="4" fill="#00f2ff" className="animate-ping opacity-75" />
            <circle cx="250" cy="150" r="3" fill="#ffffff" />
            <text x="260" y="150" fill="white" fontSize="12" className="font-bold drop-shadow-md">
              Canada
            </text>
          </g>
          <g className="cursor-pointer hover:scale-110 transition-transform">
            <circle cx="400" cy="120" r="4" fill="#00f2ff" className="animate-ping opacity-75" />
            <circle cx="400" cy="120" r="3" fill="#ffffff" />
            <text x="410" y="120" fill="white" fontSize="12" className="font-bold drop-shadow-md">
              Greenland
            </text>
          </g>
          <g className="cursor-pointer hover:scale-110 transition-transform">
            <circle cx="550" cy="180" r="4" fill="#00f2ff" className="animate-ping opacity-75" />
            <circle cx="550" cy="180" r="3" fill="#ffffff" />
            <text x="560" y="180" fill="white" fontSize="12" className="font-bold drop-shadow-md">
              Egypt
            </text>
          </g>
          <g className="cursor-pointer hover:scale-110 transition-transform">
            <circle cx="750" cy="150" r="4" fill="#00f2ff" className="animate-ping opacity-75" />
            <circle cx="750" cy="150" r="3" fill="#ffffff" />
            <text x="760" y="150" fill="white" fontSize="12" className="font-bold drop-shadow-md">
              Russia
            </text>
          </g>
        </svg>
      </CardContent>
    </Card>
  );
}
