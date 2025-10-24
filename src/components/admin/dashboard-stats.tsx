"use client";

import { Activity, Key, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoles, useUsersWithRoles } from "@/lib/hooks/use-admin";

export function DashboardStats() {
  const { data: users, isLoading: usersLoading } = useUsersWithRoles();
  const { data: roles, isLoading: rolesLoading } = useRoles();

  const stats = [
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      description: "Registered users",
      color: "blue",
    },
    {
      title: "Roles",
      value: roles?.length || 0,
      icon: Shield,
      description: "System roles",
      color: "green",
    },
    {
      title: "Permissions",
      value: "24", // يمكن جلبها ديناميكياً
      icon: Key,
      description: "Available permissions",
      color: "purple",
    },
    {
      title: "System Status",
      value: "Active",
      icon: Activity,
      description: "All systems operational",
      color: "green",
    },
  ];

  if (usersLoading || rolesLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
