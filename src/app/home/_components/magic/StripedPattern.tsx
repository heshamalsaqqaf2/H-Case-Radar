import { StripedPattern } from "@/components/ui/magic-ui/striped-pattern";

export function MagicStripedPattern() {
  return (
    <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border">
      <StripedPattern className="stroke-[0.3] [stroke-dasharray:8,4]" />
    </div>
  );
}
