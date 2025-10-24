"use client";

import {
  FileText,
  Key,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: "admin.dashboard.view",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "user.view",
  },
  {
    name: "Roles",
    href: "/admin/roles",
    icon: Shield,
    permission: "role.view",
  },
  {
    name: "Permissions",
    href: "/admin/permissions",
    icon: Key,
    permission: "permission.view",
  },
  {
    name: "Content",
    href: "/admin/content",
    icon: FileText,
    permission: "post.view",
  },
  {
    name: "System",
    href: "/admin/system",
    icon: Settings,
    permission: "settings.view",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-blue-50 text-zinc-900 border border-zinc-950"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            )}
          >
            <item.icon className="h-4 w-4 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* قسم التهيئة */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <Link
          href="/admin/seed"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            pathname === "/admin/seed"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          )}
        >
          <Key className="h-4 w-4 mr-3" />
          Database Setup
        </Link>
      </div>
    </div>
  );
}
