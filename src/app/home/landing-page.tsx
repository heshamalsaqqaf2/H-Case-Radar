import { HeroHeader } from "./components/custom/header";
import HeroSection from "./components/custom/hero-section";
import FooterSection from "./components/layout/footer-2";

export function LandingPage() {
  return (
    <>
      <HeroHeader />
      <HeroSection />
      <FooterSection />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-linear-to-t from-emerald-500/30 via-teal-600/10 via-30% to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-linear-to-t from-cyan-500/20 via-emerald-500/10 to-transparent blur-3xl" />
      </div>
    </>
  );
}