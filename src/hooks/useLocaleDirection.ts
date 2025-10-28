"use client";

import { useEffect, useState } from "react";

const rtlLanguages = ["ar", "he", "fa", "ur", "ps", "dv"];

export const useLocaleDirection = () => {
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    const savedDirection = localStorage.getItem("direction") as
      | "ltr"
      | "rtl"
      | null;
    if (savedDirection) {
      setDirection(savedDirection);
      document.documentElement.dir = savedDirection;
      return;
    }

    const browserLanguage =
      navigator.language || (navigator as any).userLanguage;

    const langCode = browserLanguage.split("-")[0];

    const isRtl = rtlLanguages.includes(langCode);
    const newDirection = isRtl ? "rtl" : "ltr";

    setDirection(newDirection);
    document.documentElement.dir = newDirection;

    localStorage.setItem("direction", newDirection);
  }, []);

  return direction;
};
