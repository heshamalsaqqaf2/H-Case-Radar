"use client";

import { Key, Loader2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleProfile } from "@/lib/authorization/hooks/use-role-profile";

interface RoleDetailsProps {
  roleId: string;
}

export function RoleDetails({ roleId }: RoleDetailsProps) {
  const { data: roleData, isLoading, error } = useRoleProfile(roleId);

  if (isLoading) {
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

  if (error || !roleData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load role details
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Details: {roleData.role.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-gray-600">{roleData.role.description}</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">
            Permissions ({roleData.permissions.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {roleData.permissions.map((perm) => (
              <Badge
                key={perm.permissionId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <Key className="h-3 w-3" />
                {perm.permissionName}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Default Role:</span>
            <span className="ml-2">
              {roleData.role.isDefault ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <span className="font-medium">Created:</span>
            <span className="ml-2">
              {new Date(roleData.role.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
