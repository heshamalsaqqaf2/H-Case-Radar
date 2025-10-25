// lib/hooks/use-roles.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignPermissionsToRole,
  createRole,
  deleteRole,
  getRoleWithPermissions,
  updateRole,
} from "@/lib/actions/role-actions";

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createRole(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        toast.success("Role created successfully");
      } else {
        toast.error("Error creating role", {
          description: result.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => updateRole(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({ queryKey: ["role"] });
        toast.success("Role updated successfully");
      } else {
        toast.error("Error updating role", {
          description: result.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        toast.success("Role deleted successfully");
      } else {
        toast.error("Error deleting role", {
          description: result.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => assignPermissionsToRole(roleId, permissionIds),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({ queryKey: ["role"] });
        toast.success("Permissions assigned successfully");
      } else {
        toast.error("Error assigning permissions", {
          description: result.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}

export function useRoleWithPermissions(roleId: string) {
  return useQuery({
    queryKey: ["role", roleId],
    queryFn: () => getRoleWithPermissions(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}
