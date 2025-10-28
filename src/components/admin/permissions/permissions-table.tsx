// components/admin/permissions/permissions-table.tsx
"use client";

import { Edit, Key, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ProtectedComponent } from "@/components/auth/protected-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeletePermission } from "@/lib/authorization/hooks/permission/use-permissions";
import { usePermissions } from "@/lib/authorization/hooks/use-admin";

export function PermissionsTable() {
  const { data: permissions = [], isLoading, error } = usePermissions();
  const deletePermissionMutation = useDeletePermission();

  const handleDelete = async (permissionId: string, permissionName: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete permission "${permissionName}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    const result = await deletePermissionMutation.mutateAsync(permissionId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error("Error", { description: result.message });
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            Failed to load permissions
            <br />
            {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-600" />
          Permissions List
        </CardTitle>
        <CardDescription>
          All available permissions in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>ABAC</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions?.map((permission) => {
                return (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                        {permission.description && (
                          <span className="text-xs text-gray-500">
                            {permission.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {permission.resource.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {permission.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {permission.conditions ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          ✅ Conditional
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                        >
                          Static
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Link
                            href={`/admin/permissions/${permission.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ProtectedComponent permission="permission.delete">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDelete(permission.id, permission.name)
                            }
                            disabled={deletePermissionMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </ProtectedComponent>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
