"use client";

import { AnimatedThemeToggler } from "@/components/ui/magic-ui/animated-theme-toggler";
import { BentoGridThird } from "./_components/bento-grid-third";
import { DraggableCardDemo } from "./_components/DraggableCardDemo";
import { GlowingEffectDemo } from "./_components/grid-items";
import { HeroSection } from "./_components/hero-section";
import { MarqueeDemo } from "./_components/magic/MarqueeDemo";
import { TextHoverEffectDemo } from "./_components/text-hover-effect-demo";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center md:gap-12 md:py-16 md:px-20">
      <HeroSection />
      <AnimatedThemeToggler />
      <MarqueeDemo />
      <GlowingEffectDemo />
      <BentoGridThird />
      <DraggableCardDemo />
      <TextHoverEffectDemo />
    </div>
  );
}
