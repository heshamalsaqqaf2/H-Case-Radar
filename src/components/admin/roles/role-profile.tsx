// components/admin/role-profile.tsx
"use client";

import { useRoleWithPermissions } from "@/lib/hooks/use-roles";

export function RoleProfile({ roleId }: { roleId: string }) {
  const { data: role, isLoading } = useRoleWithPermissions(roleId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{role.name}</h1>
      <p>{role.description}</p>
      <div>
        {role.permissions.map((perm) => (
          <span key={perm.permissionId}>{perm.permissionName}</span>
        ))}
      </div>
    </div>
  );
}
