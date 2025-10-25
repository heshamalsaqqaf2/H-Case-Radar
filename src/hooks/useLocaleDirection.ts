// أضف هذا السطر في الأعلى
"use client";

import { useEffect, useState } from "react";

// قائمة باللغات التي تُكتب من اليمين إلى اليسار
const rtlLanguages = ["ar", "he", "fa", "ur", "ku", "ps"];

export const useLocaleDirection = () => {
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    // 1. تحقق أولاً من localStorage إذا كان هناك اتجاه محفوظ
    const savedDirection = localStorage.getItem("direction") as
      | "ltr"
      | "rtl"
      | null;
    if (savedDirection) {
      setDirection(savedDirection);
      document.documentElement.dir = savedDirection;
      return; // أوقف التنفيذ إذا وجدنا قيمة محفوظة
    }

    // 2. إذا لم يكن هناك قيمة محفوظة، اكتشف لغة المتصفح
    const browserLanguage =
      navigator.language || (navigator as any).userLanguage;

    // استخراج رمز اللغة الرئيسي (مثل 'ar' من 'ar-SA')
    const langCode = browserLanguage.split("-")[0];

    // 3. تحديد الاتجاه بناءً على اللغة
    const isRtl = rtlLanguages.includes(langCode);
    const newDirection = isRtl ? "rtl" : "ltr";

    setDirection(newDirection);
    document.documentElement.dir = newDirection;

    // 4. (اختياري) احفظ الاختيار في localStorage
    localStorage.setItem("direction", newDirection);
  }, []); // المصفوفة الفارغة تعني أن هذا التأثير يعمل مرة واحدة فقط بعد تحميل المكون

  return direction;
};
