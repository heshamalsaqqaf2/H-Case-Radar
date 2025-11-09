// src/lib/authorization/hooks/admin/use-roles.ts
"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  assignPermissionsToRoleAction,
  createRoleAction,
  deleteRoleAction,
  getAllRolesAction,
  getRoleProfileDataAction,
  updateRoleAction,
} from "@/lib/authorization/actions/admin/role-actions";
import { useAdminMutation } from "@/lib/authorization/hooks/core";

// ─── Query Options ───
export const rolesListOptions = queryOptions({
  queryKey: ["roles", "list"],
  queryFn: () => getAllRolesAction(),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

const roleProfileOptions = (roleId: string) =>
  queryOptions({
    queryKey: ["roles", "profile", roleId],
    queryFn: () => getRoleProfileDataAction({ roleId }),
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

// ─── Hooks: Queries ───
// export function useRolesList() {
//   return useQuery(rolesListOptions);
// }
export function useRolesList() {
  return useQuery({ ...rolesListOptions });
}
export function useRoleProfile(roleId: string) {
  return useQuery(roleProfileOptions(roleId));
}

// ─── Hooks: Mutations ───
export function useCreateRole() {
  return useAdminMutation<{
    name: string;
    description: string;
    isDefault: boolean;
  }>({
    mutationFn: createRoleAction,
    invalidateKeys: [["roles", "list"]],
    successMessage: "تم إنشاء الدور بنجاح",
    errorMessage: "خطأ في إنشاء الدور",
  });
}

export function useUpdateRole() {
  return useAdminMutation<{
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
  }>({
    mutationFn: updateRoleAction,
    invalidateKeys: [
      ["roles", "list"],
      ["roles", "profile"],
    ],
    successMessage: "تم تحديث الدور بنجاح",
    errorMessage: "خطأ في تحديث الدور",
  });
}

export function useDeleteRole() {
  return useAdminMutation<{ id: string }>({
    mutationFn: deleteRoleAction,
    invalidateKeys: [["roles", "list"]],
    successMessage: "تم حذف الدور بنجاح",
    errorMessage: "خطأ في حذف الدور",
  });
}

export function useAssignPermissionsToRole() {
  return useAdminMutation<{
    roleId: string;
    permissionIds: string[];
  }>({
    mutationFn: assignPermissionsToRoleAction,
    invalidateKeys: [["roles", "profile"]],
    successMessage: "تم تعيين الصلاحيات بنجاح",
    errorMessage: "خطأ في تعيين الصلاحيات",
  });
}

// // src/lib/authorization/hooks/admin/use-roles.ts
// "use client";

// import { queryOptions, useQuery } from "@tanstack/react-query";
// import {
//   assignPermissionsToRoleAction,
//   createRoleAction,
//   deleteRoleAction,
//   getRoleProfileDataAction,
//   updateRoleAction,
// } from "@/lib/authorization/actions/admin/role-actions";
// import { useAdminMutation } from "@/lib/authorization/hooks/core";

// // ─── Query Options
// const roleProfileOptions = (roleId: string) =>
//   queryOptions({
//     queryKey: ["roles", roleId],
//     queryFn: () => getRoleProfileDataAction(roleId),
//     enabled: !!roleId,
//     staleTime: 30 * 1000,
//     gcTime: 2 * 60 * 1000,
//     retry: 1,
//   });

// // ─── Hooks: Queries
// export function useRoleProfile(roleId: string) {
//   return useQuery(roleProfileOptions(roleId));
// }

// // ─── Hooks: Mutations
// export function useCreateRole() {
//   return useAdminMutation<FormData>({
//     mutationFn: createRoleAction,
//     invalidateKeys: [["roles"]],
//     successMessage: "تم إنشاء الدور بنجاح",
//     errorMessage: "خطأ في إنشاء الدور",
//   });
// }
// export function useUpdateRole() {
//   return useAdminMutation<FormData>({
//     mutationFn: updateRoleAction,
//     invalidateKeys: [["roles"]],
//     successMessage: "تم تحديث الدور بنجاح",
//     errorMessage: "خطأ في تحديث الدور",
//   });
// }
// export function useDeleteRole() {
//   return useAdminMutation<string>({
//     mutationFn: deleteRoleAction,
//     invalidateKeys: [["roles"]],
//     successMessage: "تم حذف الدور بنجاح",
//     errorMessage: "خطأ في حذف الدور",
//   });
// }
// export function useAssignPermissionsToRole() {
//   return useAdminMutation<{
//     roleId: string;
//     permissionIds: string[];
//   }>({
//     mutationFn: ({ roleId, permissionIds }) =>
//       assignPermissionsToRoleAction(roleId, permissionIds),
//     invalidateKeys: [["roles"]],
//     successMessage: "تم تعيين الصلاحيات بنجاح",
//     errorMessage: "خطأ في تعيين الصلاحيات",
//   });
// }
