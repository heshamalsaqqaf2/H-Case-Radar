// src/components/admin/roles/role-permissions-manager.tsx
"use client";

import { Key, Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/lib/authorization/hooks/admin/use-permissions";
import { useAssignPermissionsToRole } from "@/lib/authorization/hooks/admin/use-roles";
import type { Permission } from "@/lib/authorization/types/permission";

interface RolePermissionsManagerProps {
  role: {
    id: string;
    name: string;
  };
  initialPermissions?: Permission[];
}

export function RolePermissionsManager({ role, initialPermissions }: RolePermissionsManagerProps) {
  const { data: permissionsResult, isLoading } = usePermissions();
  const assignPermissionsMutation = useAssignPermissionsToRole();

  // استخراج البيانات من النتيجة
  const allPermissions: Permission[] = useMemo(() => {
    if (!permissionsResult) return [];
    if (permissionsResult.success) {
      return permissionsResult.data || [];
    }
    return [];
  }, [permissionsResult]);

  // تحويل الصلاحيات المعيّنة إلى مصفوفة من IDs
  const initialSelected = useMemo(() => {
    return initialPermissions?.map((p) => p.id) || [];
  }, [initialPermissions]);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialSelected);
  const [hasChanges, setHasChanges] = useState(false);

  // تحديث selectedPermissions إذا تغيرت initialPermissions
  useEffect(() => {
    setSelectedPermissions(initialSelected);
    setHasChanges(false);
  }, [initialSelected]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSelection = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId];

      // التحقق إذا كانت هناك تغييرات
      setHasChanges(JSON.stringify(newSelection.sort()) !== JSON.stringify(initialSelected.sort()));

      return newSelection;
    });
  };

  const handleSavePermissions = async () => {
    await assignPermissionsMutation.mutateAsync(
      {
        roleId: role.id,
        permissionIds: selectedPermissions,
      },
      {
        onSuccess: () => {
          setHasChanges(false);
        },
      },
    );
  };

  const handleSelectAll = () => {
    const allPermissionIds = allPermissions.map((p) => p.id);
    setSelectedPermissions(allPermissionIds);
    setHasChanges(
      JSON.stringify(allPermissionIds.sort()) !== JSON.stringify(initialSelected.sort()),
    );
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
    setHasChanges(JSON.stringify([]) !== JSON.stringify(initialSelected.sort()));
  };

  // تجميع الصلاحيات حسب المورد
  const permissionsByResource = useMemo(() => {
    return allPermissions.reduce(
      (acc: Record<string, Permission[]>, perm: Permission) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );
  }, [allPermissions]);

  if (isLoading && !initialPermissions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
            <Key className="h-4 w-4" />
            جاري التحميل...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // إذا كان هناك خطأ في جلب الصلاحيات
  if (permissionsResult && !permissionsResult.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            خطأ في تحميل الصلاحيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">
            {permissionsResult.error.message}
            {permissionsResult.error.code}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          إدارة الصلاحيات
          <Badge variant="secondary" className="bg-linear-to-l from-purple-500 to-fuchsia-500">
            {selectedPermissions.length} صلاحية محددة
          </Badge>
        </CardTitle>
        <CardDescription>إدارة ما يمكن لهذا الدور الوصول إليه في النظام</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button
              // className="bg-gradient-to-l from-rose-400 to-red-400 border-none text-white"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedPermissions.length === 0}
            >
              إلغاء الكل
            </Button>
            <Button
              // className="bg-gradient-to-l from-purple-500 to-fuchsia-500 border-none text-white"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedPermissions.length === allPermissions.length}
            >
              تحديد الكل
            </Button>
          </div>
          <Button
            onClick={handleSavePermissions}
            disabled={assignPermissionsMutation.isPending || !hasChanges}
            size="sm"
            className="gap-2 bg-linear-to-l from-emerald-500 to-teal-500 border-none text-white"
          >
            {assignPermissionsMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            حفظ الصلاحيات
          </Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(permissionsByResource).map(([resource, perms]) => (
            <div key={resource} className="space-y-2">
              <h4 className="font-medium text-sm capitalize">{resource.replace(/_/g, " ")}</h4>
              <div dir="ltr" className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                {perms?.map((perm: Permission) => (
                  <div key={perm.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${perm.id}`}
                      checked={selectedPermissions.includes(perm.id)}
                      onCheckedChange={() => handlePermissionToggle(perm.id)}
                    />
                    <label
                      htmlFor={`perm-${perm.id}`}
                      className="text-sm cursor-pointer flex items-center ml-2 gap-2"
                    >
                      <span className="uppercase font-bold dark:text-amber-500">{perm.action}</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {perm.name}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(permissionsByResource).length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">لا توجد صلاحيات متاحة</div>
          )}
        </div>

        {/* معلومات إضافية */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-medium">الصلاحيات المحددة</div>
              <div className="text-2xl font-bold text-purple-600">{selectedPermissions.length}</div>
            </div>
            <div className="text-center">
              <div className="font-medium">الإجمالي المتاح</div>
              <div className="text-2xl font-bold text-rose-600">{allPermissions.length}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
