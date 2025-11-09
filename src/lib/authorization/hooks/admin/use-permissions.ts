// src/authorization/hooks/admin/use-permissions.ts
"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  createPermissionAction,
  deletePermissionAction,
  getAllPermissionsAction,
  getPermissionByIdAction,
  updatePermissionAction,
} from "@/lib/authorization/actions/admin/permission-actions";
import { useAdminMutation } from "@/lib/authorization/hooks/core";

// ─── Query Options
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

// ─── Hooks: Queries
export function usePermissions() {
  return useQuery(permissionsListOptions());
}
export function usePermission(id: string) {
  return useQuery(permissionDetailOptions(id));
}

// ─── Hooks: Mutations
export function useCreatePermission() {
  return useAdminMutation<FormData>({
    mutationFn: createPermissionAction,
    invalidateKeys: [["permissions"]],
    successMessage: "تم إنشاء الصلاحية بنجاح",
    errorMessage: "خطأ في إنشاء الصلاحية",
  });
}
export function useUpdatePermission() {
  return useAdminMutation<FormData>({
    mutationFn: updatePermissionAction,
    invalidateKeys: [["permissions"]],
    successMessage: "تم تحديث الصلاحية بنجاح",
    errorMessage: "خطأ في تحديث الصلاحية",
  });
}
export function useDeletePermission() {
  return useAdminMutation<string>({
    mutationFn: deletePermissionAction,
    invalidateKeys: [["permissions"]],
    successMessage: "تم حذف الصلاحية بنجاح",
    errorMessage: "خطأ في حذف الصلاحية",
  });
}
