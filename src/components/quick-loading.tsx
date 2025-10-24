"use client";

import { useEffect, useState } from "react";

interface QuickLoadingProps {
  message?: string;
  speed?: "fast" | "instant" | "smooth";
}

export function QuickLoading({
  message = "Loading...",
  speed = "smooth",
}: QuickLoadingProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // تأخير بسيط لإظهار المؤشر فقط إذا استغرق التحميل أكثر من 100ms
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible && speed === "instant") return null;

  const speedClasses = {
    fast: "animate-pulse",
    instant: "animate-none",
    smooth: "animate-pulse",
  };

  return (
    <div
      className={`flex items-center justify-center p-4 ${speedClasses[speed]}`}
    >
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {/* Spinner محسن */}
        <div className="relative">
          <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
        </div>
        <span>{message}</span>
      </div>
    </div>
  );
}

// مكون تحميل للجداول
export function TableRowLoading({ rows = 3 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <tr key={i} className="animate-pulse">
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
