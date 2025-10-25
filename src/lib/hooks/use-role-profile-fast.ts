// lib/hooks/use-role-profile-fast.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { RolePermission } from "@/lib/actions/role-actions"; // استيراد النوع
import { getRoleProfileData } from "@/lib/actions/role-actions";

// تحديث نوع البيانات المرجعة
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

export function useRoleProfileFast(roleId: string) {
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
