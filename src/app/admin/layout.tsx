import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/authentication/session";
import { getVisibleNavItems } from "./actions/sidebar-actions";
import { AdminHeader } from "./components/layout/admin-header";
import { AdminSidebar } from "./components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  let visibleNavItems: Awaited<ReturnType<typeof getVisibleNavItems>>;
  try {
    visibleNavItems = await getVisibleNavItems();
  } catch (error) {
    console.error("Failed to load sidebar items:", error);
    visibleNavItems = [];
  }

  if (visibleNavItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">لا توجد صلاحيات</h2>
          <p className="text-foreground mb-4">ليس لديك صلاحية للوصول إلى أي قسم من لوحة التحكم</p>
          <Button asChild>
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          // "--sidebar-width": "calc(var(--spacing) * 72)",
          // "--header-height": "calc(var(--spacing) * 12)",
          "--sidebar-width": "16rem", // 256px
          "--header-height": "4rem", // 64px
        } as React.CSSProperties
      }
    >
      <AdminSidebar items={visibleNavItems} user={user} />
      <SidebarInset>
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
