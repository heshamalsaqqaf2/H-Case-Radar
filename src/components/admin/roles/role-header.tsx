"use client";

import { ArrowLeft, Calendar, Edit, Key, Shield, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoleStatistics } from "@/lib/hooks/use-role-profile";
import { useRoleWithPermissions } from "@/lib/hooks/use-roles";

interface RoleHeaderProps {
  roleId: string;
}

export function RoleHeader({ roleId }: RoleHeaderProps) {
  const { data: role, isLoading: roleLoading } = useRoleWithPermissions(roleId);
  const { data: statistics, isLoading: statsLoading } =
    useRoleStatistics(roleId);

  if (roleLoading || statsLoading) {
    return <RoleHeaderSkeleton />;
  }

  if (!role) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Role not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* خلفية متدرجة */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50" />

      <CardContent className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* معلومات الأساسية */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm border">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {role.name}
                  </h1>
                  {role.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default Role
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 text-lg mb-4">{role.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created {new Date(role.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <span>{statistics?.permissionsCount || 0} permissions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* الإحصائيات والأزرار */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
            {/* الإحصائيات */}
            <div className="flex gap-4">
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm min-w-20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-bold text-gray-900">
                    {statistics?.usersCount || 0}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Users</div>
              </div>

              <div className="text-center p-3 bg-white rounded-lg border shadow-sm min-w-20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Key className="h-4 w-4 text-purple-600" />
                  <span className="text-lg font-bold text-gray-900">
                    {statistics?.permissionsCount || 0}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Permissions</div>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-2">
              <Link href={`/admin/roles/${roleId}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Role
                </Button>
              </Link>

              <Link href="/admin/roles">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoleHeaderSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50" />
      <CardContent className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-16 w-20" />
            <Skeleton className="h-16 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
