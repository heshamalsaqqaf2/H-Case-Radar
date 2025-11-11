"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

interface QuickLoadingProps {
  message?: string;
  speed?: "fast" | "instant" | "smooth";
}

export function QuickLoading({ message = "Loading...", speed = "smooth" }: QuickLoadingProps) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
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
    <div className={`flex items-center justify-center p-4 ${speedClasses[speed]}`}>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {/* Spinner محسن */}
        <div className="relative">
          <Spinner string={"إنتظر قليلا, جاري التحميل"} />
        </div>
        <span>{message}</span>
      </div>
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
