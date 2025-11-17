"use client";
// components/ui/quick-loading.tsx

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface QuickLoadingProps {
  message?: string;
  speed?: "fast" | "instant" | "smooth";
  variant?: "primary" | "success" | "waiting" | "rejected";
  steps?: string[];
  currentStep?: number;
  progress?: number; // 0 to 100
  autoMessages?: boolean;
}

const variantStyles = {
  primary: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" },
  success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  waiting: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  rejected: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

const defaultMessages = [
  "جاري التحقق من الحساب",
  "نقوم بتجهيز معلوماتك",
  "ننتظر منك الصبر",
  "نعمل على حسابك الآن",
];

export function QuickLoading({
  message = "جاري التحقق من الحساب",
  speed = "smooth",
  variant = "waiting",
  steps,
  currentStep = 0,
  progress,
  autoMessages = false,
}: QuickLoadingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message);
  const Icon = variantStyles[variant].icon;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // تحديث الرسالة تلقائيًا
  useEffect(() => {
    if (autoMessages) {
      const interval = setInterval(() => {
        setCurrentMessage(defaultMessages[Math.floor(Math.random() * defaultMessages.length)]);
      }, 3000); // تغيير كل 3 ثوانٍ

      return () => clearInterval(interval);
    } else {
      setCurrentMessage(message);
    }
  }, [autoMessages, message]);

  if (!isVisible && speed === "instant") return null;

  const speedClasses = {
    fast: "animate-pulse",
    instant: "animate-none",
    smooth: "animate-pulse",
  };

  const progressWidth = progress !== undefined ? `${progress}%` : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 p-8 max-w-md w-full rounded-xl border bg-card shadow-xl"
      >
        {/* الرمز المتحرك */}
        <div className={`p-4 rounded-full ${variantStyles[variant].bg}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={variant}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon
                className={`w-12 h-12 ${variantStyles[variant].color} ${
                  variant === "primary" || variant === "waiting" ? "animate-spin" : ""
                }`}
                aria-hidden="true"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* الرسالة */}
        <div className="text-center">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-medium text-foreground"
          >
            {currentMessage}
          </motion.p>
        </div>

        {/* شريط التقدم (إذا وُجد) */}
        {progress !== undefined && (
          <div className="w-full bg-muted rounded-full h-2.5">
            <motion.div
              className="bg-primary h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: progressWidth }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}

        {/* الخطوات (إذا وُجدت) */}
        {steps && steps.length > 0 && (
          <div className="w-full space-y-2">
            {steps.map((step, index) => (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: <>
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: index <= currentStep ? 1 : 0.5 }}
                className={`flex items-center gap-2 text-sm ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {index + 1}
                </div>
                <span>{step}</span>
                {index === currentStep && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-primary"
                  >
                    ...
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function TableRowLoading({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index.toString()} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </td>
        </tr>
      ))}
    </>
  );
}

// interface QuickLoadingProps {
//   message?: string;
//   speed?: "fast" | "instant" | "smooth";
// }

// export function QuickLoading({ message = "Loading...", speed = "smooth" }: QuickLoadingProps) {
//   const [isVisible, setIsVisible] = useState(false);
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(true);
//     }, 100);
//     return () => clearTimeout(timer);
//   }, []);
//   if (!isVisible && speed === "instant") return null;
//   const speedClasses = {
//     fast: "animate-pulse",
//     instant: "animate-none",
//     smooth: "animate-pulse",
//   };

//   return (
//     <div className={`flex items-center justify-center p-4 ${speedClasses[speed]}`}>
//       <div className="flex flex-col items-center gap-3 text-xl text-gray-600">
//         {/* Spinner محسن */}
//         <div className="relative">
//           <Spinner string={"إنتظر قليلا, جاري التحميل"} />
//         </div>
//         <p>{message}</p>
//       </div>
//     </div>
//   );
// }
