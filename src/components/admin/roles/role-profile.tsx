// components/admin/role-profile.tsx
"use client";

import { useRoleProfile } from "@/lib/authorization/hooks/use-role-profile";

export function RoleProfile({ roleId }: { roleId: string }) {
  const { data: roleProfileData, isLoading } = useRoleProfile(roleId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{roleProfileData?.role.name}</h1>
      <p>{roleProfileData?.role.description}</p>
      <div>
        {roleProfileData?.permissions.map((perm) => (
          <span key={perm.permissionId}>{perm.permissionName}</span>
        ))}
      </div>
    </div>
  );
}
