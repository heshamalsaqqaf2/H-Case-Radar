// src/components/layout/app-sidebar.tsx
"use client";

import {
  IconBrandAuth0,
  IconChartBar,
  IconCommand,
  IconDashboard,
  IconInnerShadowTop,
  IconLockAccess,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/authentication/actions/sign-out";
import type { NavItem } from "@/types/nav.types";
import { NavUser } from "./nav-user";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/admin/dashboard": IconDashboard,
  "/admin/users": IconUsers,
  "/admin/roles": IconLockAccess,
  "/admin/permissions": IconBrandAuth0,
  "/admin/companies": IconCommand,
  "/admin/analytics": IconChartBar,
  "/admin/settings": IconSettings,
};

const navSecondary = [
  { title: "الإعدادات", href: "/admin/settings" },
  { title: "المساعدة", href: "/admin/help" },
  { title: "البحث", href: "/admin/search" },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  items: NavItem[];
}

export function AdminSidebar({ items, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const user = {
    name: "المُدرِج",
    email: "admin@example.com",
    avatar: "/placeholder-avatar.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <IconInnerShadowTop className="h-5 w-5" />
                <span className="font-semibold">لوحة التحكم</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = iconMap[item.href] || IconDashboard;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarMenu className="mt-auto">
          {navSecondary.map((item) => {
            const Icon = iconMap[item.href] || IconSettings;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} onSignOut={signOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
