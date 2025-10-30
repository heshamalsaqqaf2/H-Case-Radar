"use client";

import { useQuery } from "@tanstack/react-query";
import type { RolePermission } from "@/lib/authorization/actions/role-actions";
import { getRoleProfileData } from "@/lib/authorization/actions/role-actions";

interface RoleProfileData {
  role: {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    assignedAt: Date;
  }>;
  permissions: RolePermission[];
  statistics: {
    usersCount: number;
    permissionsCount: number;
  };
  activity: Array<{
    id: number;
    action: string;
    description: string;
    timestamp: Date;
    type: "user" | "permission" | "system" | "view";
  }>;
}

export function useRoleProfile(roleId: string) {
  return useQuery({
    queryKey: ["roleProfile", roleId],
    queryFn: () =>
      getRoleProfileData(roleId) as Promise<RoleProfileData | null>,
    enabled: !!roleId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
  });
}
