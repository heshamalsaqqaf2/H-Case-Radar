"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignRoleToUser,
  getAllPermissions,
  getAllRoles,
  getUsersWithRoles,
  removeRoleFromUser,
} from "@/lib/authorization/actions/admin-actions";

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
      toast.success("تم تعيين الدور للمستخدم بنجاح");
    },
    onError: (error) => {
      toast.error("Mutation error", { description: error.message });
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
      toast.success("تم حذف الدور من المستخدم بنجاح");
    },
    onError: (error) => {
      toast.error("خطأ في حذف الدور", { description: error.message });
      // console.error("Mutation error:", error);
    },
  });
}
