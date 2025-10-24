"use client";

import { Key, Loader2, Save } from "lucide-react";
import { useMemo, useState } from "react";
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
import { usePermissions } from "@/lib/hooks/use-admin";
import { useAssignPermissions } from "@/lib/hooks/use-roles";

// تعريف نوع موحد للصلاحيات
interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  conditions?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

// نوع للصلاحيات القادمة من getRoleProfileData
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
  permissions?: RolePermission[]; // استخدام النوع المحدد
}

export function RolePermissionsManager({
  role,
  permissions: initialPermissions,
}: RolePermissionsManagerProps) {
  const { data: allPermissions = [], isLoading } = usePermissions();
  const assignPermissionsMutation = useAssignPermissions();

  // تحويل الصلاحيات إلى نوع موحد
  const permissions: Permission[] = useMemo(() => {
    if (initialPermissions) {
      // تحويل RolePermission إلى Permission
      return initialPermissions.map((perm) => ({
        id: perm.permissionId,
        name: perm.permissionName,
        description: null,
        resource: perm.resource,
        action: perm.action,
      }));
    }
    return allPermissions;
  }, [initialPermissions, allPermissions]);

  // الحصول على الصلاحيات المختارة مسبقاً
  const initialSelectedPermissions = useMemo(() => {
    if (initialPermissions) {
      return initialPermissions.map((p) => p.permissionId);
    }
    return [];
  }, [initialPermissions]);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialSelectedPermissions,
  );

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

  // تجميع الصلاحيات حسب المورد
  const permissionsByResource = useMemo(() => {
    return permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );
  }, [permissions]);

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
        {/* أزرار التحكم */}
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
                setSelectedPermissions(permissions.map((p) => p.id))
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

        {/* قائمة الصلاحيات */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(permissionsByResource).map(
            ([resource, resourcePermissions]) => (
              <div key={resource} className="space-y-2">
                <h4 className="font-medium text-sm capitalize text-gray-900">
                  {resource.replace("_", " ")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                  {resourcePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() =>
                          handlePermissionToggle(permission.id)
                        }
                      />
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-normal cursor-pointer flex items-center gap-2"
                      >
                        <span className="capitalize">{permission.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>

        {permissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Key className="h-8 w-8 mx-auto mb-2" />
            <p>No permissions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// "use client";

// import { Key, Loader2, Save } from "lucide-react";
// import { useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { usePermissions } from "@/lib/hooks/use-admin";
// import { useAssignPermissions } from "@/lib/hooks/use-roles";

// interface RolePermissionsManagerProps {
//   role: {
//     id: string;
//     permissions: Array<{
//       permissionId: string;
//       permissionName: string;
//       resource: string;
//       action: string;
//     }>;
//   };
// }

// export function RolePermissionsManager({ role }: RolePermissionsManagerProps) {
//   const { data: permissions = [], isLoading } = usePermissions();
//   const assignPermissionsMutation = useAssignPermissions();

//   const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
//     role.permissions.map((p) => p.permissionId),
//   );

//   const handlePermissionToggle = (permissionId: string) => {
//     setSelectedPermissions((prev) =>
//       prev.includes(permissionId)
//         ? prev.filter((id) => id !== permissionId)
//         : [...prev, permissionId],
//     );
//   };

//   const handleSavePermissions = async () => {
//     await assignPermissionsMutation.mutateAsync({
//       roleId: role.id,
//       permissionIds: selectedPermissions,
//     });
//   };

//   // تجميع الصلاحيات حسب المورد
//   const permissionsByResource = permissions.reduce(
//     (acc, permission) => {
//       if (!acc[permission.resource]) {
//         acc[permission.resource] = [];
//       }
//       acc[permission.resource].push(permission);
//       return acc;
//     },
//     {} as Record<string, typeof permissions>,
//   );

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Key className="h-4 w-4" />
//             Permissions
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center py-4">
//             <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Key className="h-4 w-4" />
//           Permissions
//           <Badge variant="secondary">
//             {selectedPermissions.length} selected
//           </Badge>
//         </CardTitle>
//         <CardDescription>
//           Manage what this role can access in the system
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* أزرار التحكم */}
//         <div className="flex justify-between items-center">
//           <div className="space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setSelectedPermissions([])}
//             >
//               Clear All
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() =>
//                 setSelectedPermissions(permissions.map((p) => p.id))
//               }
//             >
//               Select All
//             </Button>
//           </div>

//           <Button
//             onClick={handleSavePermissions}
//             disabled={assignPermissionsMutation.isPending}
//             size="sm"
//             className="gap-2"
//           >
//             {assignPermissionsMutation.isPending ? (
//               <Loader2 className="h-3 w-3 animate-spin" />
//             ) : (
//               <Save className="h-3 w-3" />
//             )}
//             Save Permissions
//           </Button>
//         </div>

//         {/* قائمة الصلاحيات */}
//         <div className="space-y-4 max-h-96 overflow-y-auto">
//           {Object.entries(permissionsByResource).map(
//             ([resource, resourcePermissions]) => (
//               <div key={resource} className="space-y-2">
//                 <h4 className="font-medium text-sm capitalize text-gray-900">
//                   {resource.replace("_", " ")}
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
//                   {resourcePermissions.map((permission) => (
//                     <div
//                       key={permission.id}
//                       className="flex items-center space-x-2"
//                     >
//                       <Checkbox
//                         id={`permission-${permission.id}`}
//                         checked={selectedPermissions.includes(permission.id)}
//                         onCheckedChange={() =>
//                           handlePermissionToggle(permission.id)
//                         }
//                       />
//                       <label
//                         htmlFor={`permission-${permission.id}`}
//                         className="text-sm font-normal cursor-pointer flex items-center gap-2"
//                       >
//                         <span className="capitalize">{permission.action}</span>
//                         <Badge variant="outline" className="text-xs">
//                           {permission.name}
//                         </Badge>
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ),
//           )}
//         </div>

//         {permissions.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             <Key className="h-8 w-8 mx-auto mb-2" />
//             <p>No permissions found</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
