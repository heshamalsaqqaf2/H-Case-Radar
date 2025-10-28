"use client";

import { Activity, Key, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  usePermissions,
  useRoles,
  useUsersWithRoles,
} from "@/lib/authorization/hooks/use-admin";

export function DashboardStats() {
  const { data: users, isLoading: usersLoading } = useUsersWithRoles();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: permission, isLoading: permissionLoading } = usePermissions();

  const stats = [
    {
      title: "Users",
      value: users?.length || 0,
      icon: Users,
      description: "المستخدمين المسجلين في النظام",
      color: "orange",
      bgTo: "purple",
    },
    {
      title: "Roles",
      value: roles?.length || 0,
      icon: Shield,
      description: "الأدوار الموجودة في النظام",
      color: "blue",
      bgTo: "red",
    },
    {
      title: "Permissions",
      value: permission?.length || 0,
      icon: Key,
      description: "الصلاحيات الموجودة في النظام",
      color: "orange",
      bgTo: "blue",
    },
    {
      title: "System Status",
      value: "Active",
      icon: Activity,
      description: "كل عمليات النظام تعمل بنجاح",
      color: "orange",
      bgTo: "green",
    },
  ];

  if (usersLoading || rolesLoading || permissionLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i.toString()}>
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
  // from-${stat.bgFrom}-400 ${stat.bgTo}-600
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card
          className={`relative overflow-hidden bg-gradient-to-tl from-0% from-orange-400 to-${stat.bgTo}-600`}
          key={stat.title}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-m font-medium text-white">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-2-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
