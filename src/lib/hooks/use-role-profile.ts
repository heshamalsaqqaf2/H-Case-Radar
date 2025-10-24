"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRoleActivity,
  getRoleStatistics,
  getRoleUsers,
} from "@/lib/actions/role-actions";

export function useRoleStatistics(roleId: string) {
  return useQuery({
    queryKey: ["roleStatistics", roleId],
    queryFn: () => getRoleStatistics(roleId),
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000, // 2 دقائق
  });
}

export function useRoleUsers(roleId: string) {
  return useQuery({
    queryKey: ["roleUsers", roleId],
    queryFn: () => getRoleUsers(roleId),
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRoleActivity(roleId: string) {
  return useQuery({
    queryKey: ["roleActivity", roleId],
    queryFn: () => getRoleActivity(roleId),
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000,
  });
}
