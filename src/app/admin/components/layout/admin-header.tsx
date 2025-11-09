// src/components/layout/admin-header.tsx

import { redirect } from "next/navigation";
import { AnimatedThemeToggler } from "@/components/ui/magic-ui/animated-theme-toggler";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/authentication/session";

export async function AdminHeader() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-mr-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">لوحة التحكم</h1>
        <div className="mr-auto flex items-center gap-2">
          <div className="mr-auto flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">مرحباً،</span>
            <span className="font-medium">{user.name}</span>
          </div>
          <AnimatedThemeToggler />
        </div>
      </div>
    </header>
  );
}
