// src/components/admin/roles/role-profile/role-header.tsx
"use client";

import { ArrowLeft, Calendar, Edit, Key, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";
import { QuickLoading } from "@/components/quick-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRoleProfile } from "@/lib/authorization/hooks/admin/use-roles";

interface RoleHeaderProps {
  roleId: string;
  initialData?: {
    role: {
      id: string;
      name: string;
      description: string | null;
      isDefault: boolean | null;
      createdAt: Date;
      updatedAt: Date;
    };
    statistics: {
      usersCount: number;
      permissionsCount: number;
    };
  };
}

export function RoleHeader({ roleId, initialData }: RoleHeaderProps) {
  const { data: profileResult, isLoading, isFetching } = useRoleProfile(roleId);

  // استخدام البيانات الأولية أو البيانات من الـ hook
  const data = initialData || (profileResult?.success ? profileResult.data : null);

  // عرض التحميل فقط إذا لم تكن هناك بيانات
  if (isLoading && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <QuickLoading message="جاري تحميل ملف الدور..." speed="fast" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">لم يتم العثور على الدور</div>
        </CardContent>
      </Card>
    );
  }

  const { role, statistics } = data;

  return (
    <Card className="relative overflow-hidden border-2 border-dotted border-emerald-500">
      {/* مؤشر التحديث الخفي */}
      {isFetching && (
        <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-ping"></div>
        </div>
      )}

      <div className="absolute inset-0" />
      <CardContent className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 ">
          {/* معلومات الأساسية */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg shadow-sm border border-blue-100">
                <Shield className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold uppercase">{role.name} </h1>
                  <div className="flex items-center gap-2">
                    {role.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        افتراضي
                      </Badge>
                    )}
                    {isFetching && (
                      <Badge className="text-xs bg-green-500 text-white">
                        <Zap className="h-3 w-3 ml-1 rtl:mr-1 rtl:ml-0 animate-pulse" />
                        جاري المزامنة
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-lg mb-4 leading-relaxed text-gray-600">
                  {role.description || "لا يوجد وصف لهذا الدور"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-l from-purple-500 to-fuchsia-500 text-white">
                    <Key className="h-4 w-4" />
                    <span>{statistics.permissionsCount} صلاحية</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-l from-pink-500 to-rose-500 text-white">
                    <Users className="h-4 w-4" />
                    <span>{statistics.usersCount} مستخدم</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-l from-cyan-500 to-sky-500 text-white">
                    <Calendar className="h-4 w-4" />
                    <span>
                      أنشئ في {new Date(role.createdAt).toLocaleDateString("en-US")}{" "}
                      {new Date(role.createdAt).toLocaleTimeString("en-US")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار سريعة */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Link href={`/admin/roles/${roleId}/edit`}>
              <Button className="w-full gap-2 bg-gradient-to-l from-green-500 to-emerald-500 text-white hover:bg-gradient-to-l hover:from-green-600 hover:to-emerald-600 transition-colors">
                <Edit className="h-4 w-4" />
                تعديل سريع
              </Button>
            </Link>

            <Link href="/admin/roles">
              <Button variant="outline" className="w-full gap-2 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                العودة للقائمة
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
