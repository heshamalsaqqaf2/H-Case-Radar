// src/components/admin/roles/role-profile/role-profile.tsx
"use client";

import { useRoleProfile } from "@/lib/authorization/hooks/admin/use-roles";

interface RoleProfileProps {
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

export function RoleProfile({ roleId, initialData }: RoleProfileProps) {
  const { data: profileResult, isLoading } = useRoleProfile(roleId);

  const data = initialData || (profileResult?.success ? profileResult.data : null);

  if (isLoading) return <div>جاري التحميل...</div>;
  if (!data) return <div>لم يتم العثور على الدور</div>;

  return (
    <div className="text-right">
      <h1 className="text-2xl font-bold">{data.role.name}</h1>
      <p className="text-gray-600 mt-2">{data.role.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {data.permissions.map((perm) => (
          <span key={perm.permissionId} className="bg-gray-100 px-2 py-1 rounded text-sm">
            {perm.permissionName}
          </span>
        ))}
      </div>
    </div>
  );
}
