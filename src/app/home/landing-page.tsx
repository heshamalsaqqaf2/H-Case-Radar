"use client";

import AreaChart1 from "@/components/ui/reui/charts/area-charts/area-chart-1";
import LineChart8 from "@/components/ui/reui/charts/line-charts/line-chart-8";
import { HeroSection } from "./_components/hero-section";
// import { BentoGridThird } from "./_components/bento-grid-third";
// import { DraggableCardDemo } from "./_components/DraggableCardDemo";
// import { StarsBackgroundDemo } from "./_components/demo-components-backgrounds-stars";
// import { GlowingEffectDemo } from "./_components/grid-items";
// import { MarqueeDemo } from "./_components/magic/MarqueeDemo";
// import { TextHoverEffectDemo } from "./_components/text-hover-effect-demo";

// <div className="flex flex-col items-center justify-center md:gap-12 md:py-16 md:px-20">
export function LandingPage() {
  return (
    <div>
      <HeroSection />
      <div className="@container grow w-full max-w-7xl">
        <AreaChart1 />
        <LineChart8 />
      </div>
      {/* <MarqueeDemo /> */}
      {/* <GlowingEffectDemo /> */}
      {/* <BentoGridThird /> */}
      {/* <DraggableCardDemo /> */}
      {/* <TextHoverEffectDemo /> */}
    </div>
  );
}
