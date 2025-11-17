"use client";

import { useRouter } from "next/navigation";
import { ProfessionalWaitingScreen } from "@/app/(auth)/components/account-status-screen";

export default function AccountApprovedPage() {
  const router = useRouter();

  const handleGoToHome = () => {
    router.push("/");
  };

  return (
    <ProfessionalWaitingScreen
      variant="approved"
      message="تم قبول طلبك في هذه المرحلة."
      subtitle="يمكنك الآن استخدام جميع مزايا النظام."
      onAction={handleGoToHome}
      actionText="الانتقال إلى الرئيسية"
    />
  );
}
