"use client";

import { KeyRound, Settings, ShieldPlus, UserCog, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    title: "Add User",
    description: "Create a new user account",
    icon: UserPlus,
    href: "/admin/users/new",
    permission: "user.create",
    color: "blue",
  },
  {
    title: "Create Role",
    description: "Define a new role",
    icon: ShieldPlus,
    href: "/admin/roles/new",
    permission: "role.create",
    color: "green",
  },
  {
    title: "Manage Permissions",
    description: "Configure system permissions",
    icon: KeyRound,
    href: "/admin/permissions",
    permission: "permission.view",
    color: "purple",
  },
  {
    title: "User Roles",
    description: "Assign roles to users",
    icon: UserCog,
    href: "/admin/users",
    permission: "user.manage_roles",
    color: "orange",
  },
  {
    title: "System Settings",
    description: "Configure system options",
    icon: Settings,
    href: "/admin/settings",
    permission: "settings.view",
    color: "gray",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <action.icon className={`h-6 w-6 text-${action.color}-500`} />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
