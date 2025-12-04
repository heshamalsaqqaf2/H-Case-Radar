import Earth from "@/components/ui/magic-ui/globe";
import HeroSection from "./components/custom/hero-section";
import TimelineCustom from "./components/custom/timeline";
import { WorldMapDemo } from "./components/custom/WorldMap";
import FooterSection from "./components/layout/footer-2";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <WorldMapDemo />
      <TimelineCustom />
      <FooterSection />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-linear-to-t from-green-500/30 via-emerald-600/10 dark:from-emerald-500/30 dark:via-teal-600/10 via-30% to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-linear-to-t from-blue-500/20 via-emerald-500/10 dark:from-cyan-500/20 dark:via-emerald-500/10 to-transparent blur-3xl" />
      </div>
    </>
  );
}
