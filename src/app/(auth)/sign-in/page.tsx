// app/(auth)/sign-in/page.tsx
import { checkUserSession } from "@/lib/authentication/actions/auth-actions";
import { SignInPageClient } from "./sign-in-client";

// Server Component - للتعامل مع الجلسة واتخاذ قرارات التوجيه
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await checkUserSession();
  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams.callbackUrl || "/";

  // إذا كان المستخدم مسجلاً دخوله وحالة حسابه "مقبولة"
  if (session?.user && session.user.accountStatus === "accepted") {
    // لا نقوم بالتوجيه مباشرة، بل نعرض الشاشة المناسبة
    // ونمرر الحالة إلى Client Component
  }

  return <SignInPageClient initialSession={session} callbackUrl={callbackUrl} />;
}
