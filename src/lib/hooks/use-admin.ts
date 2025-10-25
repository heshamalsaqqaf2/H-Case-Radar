// lib/hooks/use-admin.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignRoleToUser,
  getAllPermissions,
  getAllRoles,
  getUsersWithRoles,
  removeRoleFromUser,
} from "@/lib/actions/admin-actions";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: getAllPermissions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsersWithRoles() {
  return useQuery({
    queryKey: ["usersWithRoles"],
    queryFn: getUsersWithRoles,
    staleTime: 2 * 60 * 1000, // 2 دقائق
    retry: 2,
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      assignRoleToUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersWithRoles"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      removeRoleFromUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersWithRoles"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
}
