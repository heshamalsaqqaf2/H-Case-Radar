// lib/hooks/use-permissions.ts
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
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createPermission(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
        toast.success(result.message);
      } else {
        toast.error("Error creating permission", {
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

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionId: string) => deletePermission(permissionId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
        toast.success(result.message);
      } else {
        toast.error("Error deleting permission", {
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

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updatePermission(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
        toast.success(result.message);
      } else {
        toast.error("Error", { description: result.message });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}

// export function useUpdatePermission() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (formData: FormData) => updatePermission(formData),
//     onSuccess: (result) => {
//       if (result.success) {
//         queryClient.invalidateQueries({ queryKey: ["permissions"] });
//         toast.success(result.message);
//       } else {
//         toast.error("Error Updating Permission", {
//           description: result.message,
//         });
//       }
//     },
//     onError: (error) => {
//       toast.error("Error", {
//         description: error.message || "An Unexpected Error Occurred",
//       });
//     },
//   });
// }
