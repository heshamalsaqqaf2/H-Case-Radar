// src/lib/hooks/use-roles.ts
"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignPermissionsToRoleAction,
  createRoleAction,
  deleteRoleAction,
  getRoleProfileDataAction,
  updateRoleAction,
} from "@/lib/authorization/actions/admin/role-actions";

const roleProfileOptions = (roleId: string) =>
  queryOptions({
    queryKey: ["roles", roleId],
    queryFn: () => getRoleProfileDataAction(roleId),
    enabled: !!roleId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
  });

export function useRoleProfile(roleId: string) {
  return useQuery(roleProfileOptions(roleId));
}

// =============== التحديثات ===============
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

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createRoleAction(formData),
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["roles"],
        queryClient,
        "تم إنشاء الدور بنجاح",
        "خطأ في إنشاء الدور",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updateRoleAction(formData),
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["roles"],
        queryClient,
        "تم تحديث الدور بنجاح",
        "خطأ في تحديث الدور",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => deleteRoleAction(roleId),
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["roles"],
        queryClient,
        "تم حذف الدور بنجاح",
        "خطأ في حذف الدور",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}

export function useAssignPermissionsToRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => assignPermissionsToRoleAction(roleId, permissionIds),
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["roles"],
        queryClient,
        "تم تعيين الصلاحيات بنجاح",
        "خطأ في تعيين الصلاحيات",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}
