import { checkUserSession } from "@/lib/authentication/actions/auth-actions";

export async function ServerAuthWrapper({ children }: { children: React.ReactNode }) {
  const session = await checkUserSession();
  // يمكنك هنا إضافة أي منطق متعلق بالخادم فقط
  if (!session) return null;

  return <>{children}</>;
}
