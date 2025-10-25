"use client";

import { useEffect, useState } from "react";
import { SetupScreen } from "@/components/shared/setup-screen";

interface AppProviderProps {
  children: React.ReactNode;
  initialDirection: "ltr" | "rtl";
  isFirstVisit: boolean; // <-- سنستقبل هذه القيمة من الخادم
}

export function AppProvider({
  children,
  initialDirection,
  isFirstVisit,
}: AppProviderProps) {
  // الحالة تعتمد مباشرة على القيمة القادمة من الخادم
  const [isSettingUp, setIsSettingUp] = useState(isFirstVisit);

  useEffect(() => {
    document.documentElement.dir = initialDirection;
  }, [initialDirection]);

  const handleSetupComplete = () => {
    console.log("Setup finished on client. Hiding screen.");
    // لم نعد نضع الكوكيز هنا، سنفعل ذلك عبر Server Action
    setIsSettingUp(false);
  };

  return (
    <div dir={initialDirection}>
      {isSettingUp && <SetupScreen onSetupComplete={handleSetupComplete} />}
      <div style={{ display: isSettingUp ? "none" : "block" }}>{children}</div>
    </div>
  );
}
