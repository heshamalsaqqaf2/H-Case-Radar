"use client";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  message?: string;
  subMessage?: string;
}

export function LoadingState({
  className,
  message = "جاري التحميل",
  subMessage = "نعمل على تجهيز كل شيء لك, انتظر قليلا",
}: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center h-96", className)}>
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <h2 className="text-2xl font-bold">{message}</h2>
        <p className="text-muted-foreground">{subMessage}</p>
      </div>
    </div>
  );
}

// export function LoadingState() {
//   return (
//     <div className="flex items-center justify-center h-96">
//       <div className="flex flex-col items-center space-y-4">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//         <h2 className="text-2xl font-bold">Loading...</h2>
//         <p className="text-muted-foreground">Please wait while the page loads.</p>
//       </div>
//     </div>
//   );
// }