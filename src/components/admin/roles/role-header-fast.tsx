"use client";

import {
  ArrowLeft,
  Calendar,
  Edit,
  Key,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { QuickLoading } from "@/components/quick-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRoleProfileFast } from "@/lib/hooks/use-role-profile-fast";

interface RoleHeaderFastProps {
  roleId: string;
}

export function RoleHeaderFast({ roleId }: RoleHeaderFastProps) {
  const {
    data: profileData,
    isLoading,
    isFetching,
  } = useRoleProfileFast(roleId);

  // عرض التحميل فقط إذا لم تكن هناك بيانات
  if (isLoading && !profileData) {
    return (
      <Card>
        <CardContent className="p-6">
          <QuickLoading message="Loading role profile..." speed="fast" />
        </CardContent>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Role not found</div>
        </CardContent>
      </Card>
    );
  }

  const { role, statistics } = profileData;

  return (
    <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
      {/* مؤشر التحديث الخفي */}
      {isFetching && (
        <div className="absolute top-2 right-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50/30" />

      <CardContent className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* معلومات الأساسية */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm border border-blue-100">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {role.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    {role.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {isFetching && (
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        <Zap className="h-3 w-3 mr-1 animate-pulse" />
                        Syncing
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                  {role.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created {new Date(role.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                    <Key className="h-4 w-4" />
                    <span>{statistics.permissionsCount} permissions</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                    <Users className="h-4 w-4" />
                    <span>{statistics.usersCount} users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار سريعة */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Link href={`/admin/roles/${roleId}/edit`}>
              <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 transition-colors">
                <Edit className="h-4 w-4" />
                Quick Edit
              </Button>
            </Link>

            <Link href="/admin/roles">
              <Button
                variant="outline"
                className="w-full gap-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
