import { HexagonBackground } from "@/components/ui/animate-ui/backgrounds/hexagon";

export const HexagonBackgroundDemo = () => {
  return (
    <div className="w-full h-full">
      <HexagonBackground className="absolute inset-0 flex items-center justify-center rounded-xl w-full h-full" />
    </div>
  );
};
