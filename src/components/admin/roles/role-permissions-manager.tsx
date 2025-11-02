"use client";

import { Key, Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAssignPermissionsToRole } from "@/lib/authorization/hooks/admin/use-roles";
import { usePermissions } from "@/lib/authorization/hooks/admin/use-users";

interface RolePermission {
  permissionId: string;
  permissionName: string;
  resource: string;
  action: string;
}

interface RolePermissionsManagerProps {
  role: {
    id: string;
    name: string;
  };
  initialPermissions?: RolePermission[]; // الصلاحيات المعيّنة مسبقًا
}

export function RolePermissionsManager({
  role,
  initialPermissions,
}: RolePermissionsManagerProps) {
  const { data: allPermissions = [], isLoading } = usePermissions();
  const assignPermissionsMutation = useAssignPermissionsToRole();

  // تحويل الصلاحيات المعيّنة إلى مصفوفة من IDs
  const initialSelected = useMemo(() => {
    return initialPermissions?.map((p) => p.permissionId) || [];
  }, [initialPermissions]);

  const [selectedPermissions, setSelectedPermissions] =
    useState<string[]>(initialSelected);

  // تحديث selectedPermissions إذا تغيرت initialPermissions (مهم عند التحديث من السيرفر)
  useEffect(() => {
    setSelectedPermissions(initialSelected);
  }, [initialSelected]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleSavePermissions = async () => {
    await assignPermissionsMutation.mutateAsync({
      roleId: role.id,
      permissionIds: selectedPermissions,
    });
  };

  // تجميع جميع الصلاحيات (المتاحة في النظام)
  const permissionsByResource = useMemo(() => {
    return allPermissions.reduce(
      (acc, perm) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push(perm);
        return acc;
      },
      {} as Record<string, typeof allPermissions>,
    );
  }, [allPermissions]);

  if (isLoading && !initialPermissions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Permissions
          <Badge variant="secondary">
            {selectedPermissions.length} selected
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage what this role can access in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPermissions([])}
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedPermissions(allPermissions.map((p) => p.id))
              }
            >
              Select All
            </Button>
          </div>
          <Button
            onClick={handleSavePermissions}
            disabled={assignPermissionsMutation.isPending}
            size="sm"
            className="gap-2"
          >
            {assignPermissionsMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            Save Permissions
          </Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(permissionsByResource).map(([resource, perms]) => (
            <div key={resource} className="space-y-2">
              <h4 className="font-medium text-sm capitalize text-gray-900">
                {resource.replace("_", " ")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                {perms.map((perm) => (
                  <div key={perm.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${perm.id}`}
                      checked={selectedPermissions.includes(perm.id)}
                      onCheckedChange={() => handlePermissionToggle(perm.id)}
                    />
                    <label
                      htmlFor={`perm-${perm.id}`}
                      className="text-sm cursor-pointer flex items-center gap-2"
                    >
                      <span className="capitalize">{perm.action}</span>
                      <Badge variant="outline" className="text-xs">
                        {perm.name}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
