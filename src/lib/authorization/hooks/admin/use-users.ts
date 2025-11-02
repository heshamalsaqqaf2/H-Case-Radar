// src/lib/hooks/use-users.ts
"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignRoleToUserAction,
  getUsersWithRolesAction,
  removeRoleFromUserAction,
} from "@/lib/authorization/actions/admin/user-actions";

// =============== الاستعلامات ===============
const usersListOptions = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: () => getUsersWithRolesAction(),
    staleTime: 30 * 1000,
  });

export function useUsers() {
  return useQuery(usersListOptions());
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

export function useAssignRoleToUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { userId: string; roleId: string }) => {
      const formData = new FormData();
      formData.append("userId", variables.userId);
      formData.append("roleId", variables.roleId);
      return assignRoleToUserAction(formData);
    },
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["users"],
        queryClient,
        "تم تعيين الدور بنجاح",
        "خطأ في تعيين الدور",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { userId: string; roleId: string }) => {
      const formData = new FormData();
      formData.append("userId", variables.userId);
      formData.append("roleId", variables.roleId);
      return removeRoleFromUserAction(formData);
    },
    onSuccess: (result) => {
      handleMutationSuccess(
        result,
        ["users"],
        queryClient,
        "تم إزالة الدور بنجاح",
        "خطأ في إزالة الدور",
      );
    },
    onError: (error) => {
      toast.error("خطأ غير متوقع", {
        description: error.message || "يرجى المحاولة لاحقًا",
      });
    },
  });
}
