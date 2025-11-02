"use client";

import { ProtectedComponent } from "@/components/auth/protected-component";
import AreaChart1 from "@/components/ui/reui/charts/area-charts/area-chart-1";
import LineChart8 from "@/components/ui/reui/charts/line-charts/line-chart-8";
import { HeroSection } from "./_components/hero-section";
import FeaturesSection from "./_components/layout/features";
import Features from "./_components/layout/features-12";
import FooterSection from "./_components/layout/footer-2";
// import { BentoGridThird } from "./_components/bento-grid-third";
// import { DraggableCardDemo } from "./_components/DraggableCardDemo";
// import { StarsBackgroundDemo } from "./_components/demo-components-backgrounds-stars";
// import { GlowingEffectDemo } from "./_components/grid-items";
// import { MarqueeDemo } from "./_components/magic/MarqueeDemo";
// import { TextHoverEffectDemo } from "./_components/text-hover-effect-demo";

// <div className="flex flex-col items-center justify-center md:gap-12 md:py-16 md:px-20">
export function LandingPage() {
  return (
    <ProtectedComponent permission="system.access">
      <div>
        <HeroSection />
        <div className="m-10">
          <AreaChart1 />
          <LineChart8 />
        </div>
        <Features />
        <FeaturesSection />
        <FooterSection />
        {/* <MarqueeDemo /> */}
        {/* <GlowingEffectDemo /> */}
        {/* <BentoGridThird /> */}
        {/* <DraggableCardDemo /> */}
        {/* <TextHoverEffectDemo /> */}
      </div>
    </ProtectedComponent>
  );
}
