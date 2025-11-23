"use client";

import { cn } from "@/lib/utils";

interface EmotionalLoadingProps {
  className?: string;
  message?: string;
  subMessage?: string;
}

export function EmotionalLoading({
  className,
  message = "جاري التحميل",
  subMessage = "نعمل على تجهيز كل شيء لك, انتظر قليلا",
}: EmotionalLoadingProps) {
  return (
    // <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
    //   <div className="flex flex-col items-center space-y-6">
    //     {/* Elegant Spinner */}
    //     <div className="relative">
    //       <div className="w-12 h-12 border-3 border-gray-200 rounded-full" />
    //       <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-t-primary rounded-full animate-spin" />
    //     </div>

    //     {/* Text Content */}
    //     <div className="text-center space-y-2">
    //       <h3 className="font-bold text-lg text-foreground">{message}</h3>
    //       <p className="text-sm text-muted-foreground">{subMessage}</p>
    //     </div>

    //     {/* Subtle Progress Dots */}
    //     {/* <div className="flex space-x-1.5">
    //       {[0, 1, 2].map((i) => (
    //         <div
    //           key={i}
    //           className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse"
    //           style={{
    //             animationDelay: `${i * 200}ms`,
    //             animationDuration: "1.4s",
    //           }}
    //         />
    //       ))}
    //     </div> */}
    //   </div>
    // </div>
    <div className={cn("flex items-center justify-center h-96", className)}>
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <h2 className="text-2xl font-bold">{message}</h2>
        <p className="text-muted-foreground">{subMessage}</p>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <h2 className="text-2xl font-bold">Loading...</h2>
        <p className="text-muted-foreground">Please wait while the page loads.</p>
      </div>
    </div>
  );
}