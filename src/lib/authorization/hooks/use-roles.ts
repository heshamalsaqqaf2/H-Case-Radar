// lib/hooks/use-roles.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignPermissionsToRole,
  createRole,
  deleteRole,
  updateRole,
} from "@/lib/authorization/actions/role-actions";

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createRole(formData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        toast.success("تم إنشاء الدور بنجاح");
      } else {
        toast.error("خطأ في إنشاء الدور", {
          description: result.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error.message || "عذراً، حدث خطأ غير متوقع, من فضلك أعد المحاولة",
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
        toast.success("تم تحديث الدور بنجاح");
      } else {
        toast.error("خطأ في تحديث الدور", {
          description: result.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error.message || "عذراً، حدث خطأ غير متوقع, من فضلك أعد المحاولة",
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
        toast.success("تم حذف الدور بنجاح");
      } else {
        toast.error("خطأ في حذف الدور", {
          description: result.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error.message || "عذراً، حدث خطأ غير متوقع, من فضلك أعد المحاولة",
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
        toast.success("تم تعيين الصلاحيات لهذا الدور بنجاح");
      } else {
        toast.error("خطأ في تعيين الصلاحيات لهذا الدور", {
          description: result.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error.message || "عذراً، حدث خطأ غير متوقع, من فضلك أعد المحاولة",
      });
    },
  });
}
