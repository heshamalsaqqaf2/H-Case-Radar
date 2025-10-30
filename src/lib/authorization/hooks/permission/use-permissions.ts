"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createPermission,
  deletePermission,
  updatePermission,
} from "@/lib/authorization/actions/permission/permission-actions";

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await fetch("/api/permissions");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createPermission(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
        console.log(result.message);
      } else {
        console.log(result.message);
      }
    },
    onError: (error) => {
      console.log(error.message);
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionId: string) => deletePermission(permissionId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
        console.log(result.message);
      } else {
        console.log(result.message);
      }
    },
    onError: (error) => {
      console.log(error.message);
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updatePermission(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
        console.log(result.message);
      } else {
        console.log(result.message);
      }
    },
    onError: (error) => {
      console.log(error.message);
    },
  });
}
