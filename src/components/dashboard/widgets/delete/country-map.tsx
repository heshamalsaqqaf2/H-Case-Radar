/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const countries = [
  { name: "Greenland", top: "20%", left: "35%" },
  { name: "Russia", top: "25%", left: "75%" },
  { name: "Canada", top: "30%", left: "20%" },
  { name: "Egypt", top: "45%", left: "55%" },
];

export function CountryMap() {
  return (
    <Card className="scifi-card rounded-lg h-full min-h-[300px]">
      <CardHeader className="absolute top-0 left-0 z-10 w-full">
        <CardTitle className="text-lg font-medium text-primary">Top Country Sales</CardTitle>
      </CardHeader>

      <CardContent className="p-0 h-full w-full relative">
        {/* Abstract Map Background */}
        <div className="absolute inset-0 opacity-20">
          {/* Simple SVG World Map Silhouette */}
          <svg viewBox="0 0 1000 500" className="w-full h-full fill-primary">
            <path d="M200,150 Q250,100 300,150 T400,150 T500,200 T600,150 T700,100 T800,150 V300 H200 Z" />
            {/* This is just a dummy shape, a real map path would be huge. 
                 Using a grid/dot pattern instead might be better if no map available. */}
          </svg>
          <div className="absolute inset-0 bg-[url('/images/world-map.png')] bg-contain bg-no-repeat bg-center opacity-30" />
        </div>

        {/* Grid Lines for SciFi feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Country Markers */}
        {countries.map((country) => (
          <div
            key={country.name}
            className="absolute flex items-center gap-2"
            style={{ top: country.top, left: country.left }}
          >
            <div className="relative">
              <div className="w-3 h-3 bg-primary rounded-full animate-ping absolute opacity-75" />
              <div className="w-3 h-3 bg-primary rounded-full relative z-10 shadow-[0_0_10px_var(--primary)]" />
            </div>
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-primary/20">
              {country.name}
            </span>
          </div>
        ))}

        {/* Connecting Lines (Decorative) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M200,150 L550,225 L750,125"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeDasharray="5,5"
            fill="none"
            className="opacity-30"
          />
        </svg>

      </CardContent>
    </Card>
  );
}
