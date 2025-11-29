"use client";

import {
  IconBell,
  IconBriefcase,
  IconChartPie,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconLayoutDashboard,
  IconLockAccess,
  IconSettings,
  IconShield,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import type * as React from "react";
import { NavMain } from "@/components/dashboard/layout/nav-main";
import { NavSecondary } from "@/components/dashboard/layout/nav-secondary";
import { NavUser } from "@/components/dashboard/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Hesham Alsaqqaf",
    email: "admin@hcase-radar.com",
    avatar: "/images/avatar.jpg",
  },
  navMain: [
    {
      title: "لوحة التحكم",
      url: "#",
      icon: IconDashboard,
      isActive: true,
      items: [
        { title: "الرئيسية", url: "#" },
        { title: "البلاغات", url: "#" },
        { title: "الإدوار", url: "#" },
        { title: "الصلاحيات", url: "#", isActive: true },
      ],
    },
    {
      title: "الصفحات",
      url: "#",
      icon: IconFileDescription,
    },
    {
      title: "الإدوار",
      url: "#",
      icon: IconLayoutDashboard,
    },
    {
      title: "الصلاحيات",
      url: "#",
      icon: IconLockAccess,
    },
    {
      title: "الإحصائيات",
      url: "#",
      icon: IconBriefcase, // Placeholder icon
    },
    {
      title: "التقارير",
      url: "#",
      icon: IconChartPie,
    },
    {
      title: "الإشعارات",
      url: "#",
      icon: IconBell,
    },
    {
      title: "التدقيق الأمني",
      url: "#",
      icon: IconShield,
    },
    {
      title: "قاعدة البيانات",
      url: "#",
      icon: IconDatabase,
    },
  ],
  navSecondary: [
    {
      title: "الإعدادات",
      url: "#",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className="border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl">
      {/* Gradient Glow Effect - From Bottom */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-linear-to-t from-emerald-500/30 via-teal-600/10 via-30% to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-1/4 bg-linear-to-t from-cyan-500/20 via-emerald-500/10 to-transparent blur-3xl" />
      </div>

      {/* Sidebar Background Image Layer - Enhanced */}
      {/* <div className="absolute inset-0 z-0 pointer-events-none opacity-10 mix-blend-overlay overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(0,242,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
      </div> */}

      <SidebarHeader className="relative z-10 pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-12 hover:bg-transparent data-[state=open]:bg-transparent">
              <Link href="/dashboard" className="flex items-center gap-3 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,242,255,0.5)] border border-primary/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
                  <IconWorld className="size-5 relative z-10" />
                </div>
                <span className="text-lg font-bold tracking-wider text-foreground drop-shadow-[0_0_5px_rgba(0,242,255,0.5)] font-mono">
                  H-Case Radar
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>

      <SidebarFooter className="relative z-10">
        {/* Custom Footer / User Profile can go here if NavUser isn't enough */}
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
