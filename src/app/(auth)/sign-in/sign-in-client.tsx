// app/(auth)/sign-in/sign-in-client.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfessionalWaitingScreen } from "@/app/(auth)/components/account-status-screen";
import { useSession } from "@/lib/authentication/hooks/use-auth";
import { SignInForm } from "../components/sign-in-form";

// تعريف نوع الجلسة
interface SessionData {
  user?: {
    id: string;
    email: string;
    accountStatus: string;
  };
}

interface SignInPageClientProps {
  initialSession: SessionData | null;
  callbackUrl: string;
}

export function SignInPageClient({ initialSession, callbackUrl }: SignInPageClientProps) {
  const sessionQuery = useSession();
  const [isChecking, setIsChecking] = useState(true);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const router = useRouter();

  // التحقق من وجود بيانات الجلسة
  const currentSession = sessionQuery.data || initialSession;

  useEffect(() => {
    if (!sessionQuery.isLoading) {
      setIsChecking(false);
    }
  }, [sessionQuery.isLoading]);

  // تتبع تغيير الحالة وتحديث المكون فورًا
  useEffect(() => {
    if (currentSession?.user?.accountStatus) {
      const currentStatus = currentSession.user.accountStatus;
      if (lastStatus && lastStatus !== currentStatus) {
        // الحالة تغيرت، قم بتحديث الصفحة فورًا
        console.log("Status changed from", lastStatus, "to", currentStatus);
      }
      setLastStatus(currentStatus);
    }
  }, [currentSession?.user?.accountStatus, lastStatus]); // تم إصلاح قائمة الاعتماد

  // عرض شاشة التحميل أثناء التحقق
  if (sessionQuery.isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  // عرض شاشة القبول إذا كانت الحالة "accepted"
  if (currentSession?.user?.accountStatus === "accepted") {
    return (
      <ProfessionalWaitingScreen
        variant="approved"
        message="تم تفعيل حسابك بنجاح."
        subtitle="يمكنك الآن استخدام جميع مزايا النظام."
        onAction={() => router.push("/")}
        actionText="الانتقال إلى الصفحة الرئيسية"
        showRefreshButton={true}
        onRefresh={() => {}}
      />
    );
  }

  // عرض شاشة الانتظار إذا كانت الحالة "pending"
  if (currentSession?.user?.accountStatus === "pending") {
    return (
      <ProfessionalWaitingScreen
        variant="pending"
        subtitle="سيتم إعلامك عبر البريد الإلكتروني فور الانتهاء من المراجعة"
        showRefreshButton={true}
        onRefresh={() => {
          sessionQuery.refetch(); // استدعاء refetch يدويًا
        }}
      />
    );
  }

  // عرض شاشة الرفض إذا كانت الحالة "rejected"
  if (currentSession?.user?.accountStatus === "rejected") {
    return (
      <ProfessionalWaitingScreen
        variant="rejected"
        message="عذرًا، لم تُقبل طلباتك في هذه المرحلة."
        subtitle="يرجى التواصل مع فريق الدعم عبر البريد: support@h-case-radar.com"
        showRefreshButton={true}
        onRefresh={() => {
          sessionQuery.refetch(); // استدعاء refetch يدويًا
        }}
      />
    );
  }

  // عرض نموذج تسجيل الدخول إذا لم يكن المستخدم مسجل دخوله
  return <SignInForm callbackUrl={callbackUrl} />;
}
