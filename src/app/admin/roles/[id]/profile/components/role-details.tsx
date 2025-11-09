// src/components/admin/roles/role-profile/role-details.tsx
"use client";

import { Key, Loader2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleProfile } from "@/lib/authorization/hooks/admin/use-roles";

interface RoleDetailsProps {
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
    permissions: Array<{
      permissionId: string;
      permissionName: string;
      resource: string;
      action: string;
    }>;
  };
}

export function RoleDetails({ roleId, initialData }: RoleDetailsProps) {
  const { data: profileResult, isLoading, error } = useRoleProfile(roleId);

  // استخدام البيانات الأولية أو البيانات من الـ hook
  const data = initialData || (profileResult?.success ? profileResult.data : null);

  if (isLoading && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">فشل في تحميل تفاصيل الدور</div>
        </CardContent>
      </Card>
    );
  }

  const { role, permissions } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
          <Shield className="h-5 w-5" />
          تفاصيل الدور: {role.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">الوصف</h4>
          <p className="text-gray-600">{role.description || "لا يوجد وصف"}</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">الصلاحيات ({permissions.length})</h4>
          <div className="flex flex-wrap gap-2">
            {permissions.map((perm) => (
              <Badge
                key={perm.permissionId}
                variant="secondary"
                className="flex items-center gap-1 rtl:flex-row-reverse"
              >
                <Key className="h-3 w-3" />
                {perm.permissionName}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">دور افتراضي:</span>
            <span className="mr-2 rtl:ml-2 rtl:mr-0">{role.isDefault ? "نعم" : "لا"}</span>
          </div>
          <div>
            <span className="font-medium">تاريخ الإنشاء:</span>
            <span className="mr-2 rtl:ml-2 rtl:mr-0">
              {new Date(role.createdAt).toLocaleDateString("ar-SA")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
