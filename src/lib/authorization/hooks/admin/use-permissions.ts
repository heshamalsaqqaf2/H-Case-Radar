// src/lib/hooks/use-permissions.ts
"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createPermissionAction,
  deletePermissionAction,
  getAllPermissionsAction,
  getPermissionByIdAction,
  updatePermissionAction,
} from "@/lib/authorization/actions/admin/permission-actions";

// import type { SafePermission } from "@/lib/types/permission";

const permissionsListOptions = () =>
  queryOptions({
    queryKey: ["permissions"],
    queryFn: () => getAllPermissionsAction(),
    staleTime: 5 * 60 * 1000,
  });

const permissionDetailOptions = (id: string) =>
  queryOptions({
    queryKey: ["permissions", id],
    queryFn: () => getPermissionByIdAction(id),
    enabled: !!id,
  });

export function usePermissions() {
  return useQuery(permissionsListOptions());
}

export function usePermission(id: string) {
  return useQuery(permissionDetailOptions(id));
}

// TODO: =============== التحديثات ===============
const handleMutationSuccess = (
  result: {
    success: boolean;
    data?: { message: string };
    error?: { message: string };
  },
  invalidateKey: string[],
  queryClient: ReturnType<typeof useQueryClient>,
  successMessage: string,
  errorMessagePrefix: string,
) => {
  if (result.success) {
    queryClient.invalidateQueries({ queryKey: invalidateKey });
    toast.success(result.data?.message || successMessage);
  } else {
    toast.error(errorMessagePrefix, {
      description: result.error?.message || "حدث خطأ غير متوقع",
    });
  }
};

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createPermissionAction(formData),
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["permissions"],
        queryClient,
        "تم إنشاء الصلاحية بنجاح",
        "خطأ في إنشاء الصلاحية",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updatePermissionAction(formData),
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["permissions"],
        queryClient,
        "تم تحديث الصلاحية بنجاح",
        "خطأ في تحديث الصلاحية",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) => deletePermissionAction(permissionId),
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["permissions"],
        queryClient,
        "تم حذف الصلاحية بنجاح",
        "خطأ في حذف الصلاحية",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}
