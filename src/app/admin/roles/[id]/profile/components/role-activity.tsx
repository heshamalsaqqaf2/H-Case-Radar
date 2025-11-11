// src/components/admin/roles/role-profile/role-activity.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { Activity, Clock, Settings, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleActivityProps {
  roleId: string;
  initialActivity?:
    | Array<{
        id: string;
        action: string;
        description: string;
        timestamp: Date;
        type: "view" | "create" | "update" | "delete";
      }>
    | undefined;
}

export function RoleActivity({ roleId, initialActivity = [] }: RoleActivityProps) {
  // استخدام البيانات الأولية مباشرة - يمكن إضافة hook إذا كنت تريد تحديث البيانات
  const displayActivities = initialActivity;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "permission":
        return <Shield className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      case "view":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user":
        return "text-green-600 bg-green-50";
      case "permission":
        return "text-blue-600 bg-blue-50";
      case "system":
        return "text-purple-600 bg-purple-50";
      case "view":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "الآن";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 168) return `منذ ${Math.floor(diffInHours / 24)} يوم`;
    return `منذ ${Math.floor(diffInHours / 168)} أسبوع`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
          <Activity className="h-5 w-5" />
          النشاط الحديث
        </CardTitle>
        <CardDescription>الإجراءات والتغييرات الحديثة المتعلقة بهذا الدور</CardDescription>
      </CardHeader>
      <CardContent>
        {displayActivities.length > 0 ? (
          <div className="space-y-4">
            {displayActivities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0 rtl:flex-row-reverse"
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 rtl:flex-row-reverse">
                    <span className="font-medium text-sm">{activity.action}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 rtl:flex-row-reverse">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد نشاط حديث</h3>
            <p className="text-gray-500">سيظهر النشاط هنا عند إجراء تغييرات على هذا الدور.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RoleActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 rtl:flex-row-reverse">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
