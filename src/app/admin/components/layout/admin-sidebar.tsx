"use client";

import { IconInnerShadowTop, IconLockAccessOff } from "@tabler/icons-react";
import { Database, LayoutDashboard, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOutAction } from "@/lib/authentication/actions/sign-out-action";
import { ICON_MAP } from "@/lib/utils/icons";
import type { NavItem } from "@/types/nav.types";
import { NavUser } from "./nav-user";

interface AdminSidebarProps {
  items: NavItem[];
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AdminSidebar({ items, user }: AdminSidebarProps) {
  const pathname = usePathname();

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center flex flex-col items-center-safejustify-center gap-2">
          <IconLockAccessOff className="size-8 text-red-600" />
          <h1 className="text-3xl font-semibold text-red-600">No sidebar items</h1>
          <p className="mt-2 text-sm text-muted-foreground">لا توجد لديك صلاحيات</p>
        </div>
      </div>
    );
  }
  return (
    <Sidebar collapsible="icon" variant="floating" side="right">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">H-Case Radar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-2">
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP] || LayoutDashboard;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href} className="">
                      <IconComponent />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.image ?? undefined,
          }}
          onSignOut={signOutAction}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
