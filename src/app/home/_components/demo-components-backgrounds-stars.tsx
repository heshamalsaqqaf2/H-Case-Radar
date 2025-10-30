import { useTheme } from "next-themes";
import { StarsBackground } from "@/components/ui/animate-ui/backgrounds/stars";
import { cn } from "@/lib/utils";

export const StarsBackgroundDemo = () => {
  const { resolvedTheme } = useTheme();
  return (
    <StarsBackground
      starColor={resolvedTheme === "dark" ? "#fff" : "#000"}
      className={cn(
        "absolute inset-0 flex items-center justify-center w-full h-ful",
        "dark:bg-[radial-gradient(ellipse_at_top,_#00FF7F_0%,_#000_70%)] bg-[radial-gradient(ellipse_at_top,_#FFBF00_0%,_#222_100%)]",
        // "dark:bg-[radial-gradient(ellipse_at_top,_#0000FF_0%,_#000_100%)] bg-[radial-gradient(ellipse_at_bottom,_#FFBF00_0%,_#fff_50%)]",
      )}
    />
  );
};
