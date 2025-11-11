// src/lib/authorization/hooks/admin/use-users.ts
"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  assignRoleToUserAction,
  createUserAction,
  getCurrentUserAction,
  getUserStatisticsAction,
  getUsersWithRolesAction,
  removeRoleFromUserAction,
  toggleUserBanAction,
  updateUserProfileAction,
} from "@/lib/authorization/actions/admin/user-actions";
import { useAdminMutation } from "@/lib/authorization/hooks/core";
import type { ApiResponse, QueryOptions } from "@/lib/authorization/types/api";
import type { UpdateUserInput, UserWithRoles } from "@/lib/authorization/types/user";

// ─── Query Options ───
const usersListOptions = (options?: QueryOptions<UserWithRoles[]>) =>
  queryOptions({
    queryKey: ["users"],
    queryFn: (): Promise<ApiResponse<UserWithRoles[]>> => getUsersWithRolesAction(),
    staleTime: options?.staleTime ?? 30 * 1000,
    initialData: options?.initialData,
  });

const currentUserOptions = () =>
  queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUserAction(),
    staleTime: 10 * 60 * 1000,
  });

const userStatisticsOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", "statistics", userId],
    queryFn: () => getUserStatisticsAction({ userId }),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

// ─── Hooks: Queries ───
export function useUsers(options?: QueryOptions<UserWithRoles[]>) {
  return useQuery(usersListOptions(options));
}

export function useCurrentUser() {
  return useQuery(currentUserOptions());
}

export function useUserStatistics(userId: string) {
  return useQuery(userStatisticsOptions(userId));
}

// ─── Hooks: Mutations ───
export function useAssignRoleToUser() {
  return useAdminMutation<{ userId: string; roleId: string }>({
    mutationFn: ({ userId, roleId }) => {
      return assignRoleToUserAction({ userId, roleId });
    },
    invalidateKeys: [["users"], ["users", "statistics"]],
    successMessage: "تم تعيين الدور بنجاح",
    errorMessage: "خطأ في تعيين الدور",
  });
}
export function useRemoveRoleFromUser() {
  return useAdminMutation<{ userId: string; roleId: string }>({
    mutationFn: ({ userId, roleId }) => {
      return removeRoleFromUserAction({ userId, roleId });
    },
    invalidateKeys: [["users"], ["users", "statistics"]],
    successMessage: "تم إزالة الدور بنجاح",
    errorMessage: "خطأ في إزالة الدور",
  });
}
export function useUpdateUserProfile() {
  return useAdminMutation<{ targetUserId: string; updates: UpdateUserInput }>({
    mutationFn: updateUserProfileAction,
    invalidateKeys: [["users"], ["users", "statistics"]],
    successMessage: "تم تحديث المستخدم بنجاح",
    errorMessage: "خطأ في تحديث المستخدم",
  });
}
export function useBanUser() {
  return useAdminMutation<{ targetUserId: string; reason?: string }>({
    mutationFn: ({ targetUserId, reason }) =>
      toggleUserBanAction({ targetUserId, ban: true, reason }),
    invalidateKeys: [["users"], ["users", "statistics"]],
    successMessage: "تم حظر المستخدم بنجاح",
    errorMessage: "خطأ في حظر المستخدم",
  });
}
export function useUnbanUser() {
  return useAdminMutation<{ targetUserId: string }>({
    mutationFn: ({ targetUserId }) => toggleUserBanAction({ targetUserId, ban: false }),
    invalidateKeys: [["users"], ["users", "statistics"]],
    successMessage: "تم فك حظر المستخدم بنجاح",
    errorMessage: "خطأ في فك حظر المستخدم",
  });
}
export function useCreateUser() {
  return useAdminMutation({
    mutationFn: createUserAction,
    invalidateKeys: [["users"], ["users", "statistics"]],
    successMessage: "تم إنشاء المستخدم بنجاح",
    errorMessage: "خطأ في إنشاء المستخدم",
  });
}

// ─── Hooks: Utilities ───
export const useCurrentUserManagement = () => {
  const { data: currentUserResult, isLoading, error } = useCurrentUser();
  const currentUser = currentUserResult?.success ? currentUserResult.data : null;

  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated: !!currentUser,
    hasPermission: async (_permission: string) => {
      if (!currentUser) return false;
      // try {
      //   // ✅ استخدام Server Action مباشرة - بدون أي استيراد لـ authorization-service
      //   const result = await getUsersWithRolesAndPermissionsAction();
      //   return result.success ? result.data : false;
      // } catch {
      //   return false;
      // }
    },
  };
};
export const useUserManagement = (userId: string) => {
  const { data: userStats, isLoading: statsLoading, error: statsError } = useUserStatistics(userId);
  const updateProfileMutation = useUpdateUserProfile();
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const assignRoleMutation = useAssignRoleToUser();
  const removeRoleMutation = useRemoveRoleFromUser();

  return {
    // البيانات
    statistics: userStats?.success ? userStats.data : null,
    statsLoading,
    statsError: statsError || (userStats?.success === false ? userStats.error : null),

    // الإجراءات
    updateProfile: (updates: UpdateUserInput) =>
      updateProfileMutation.mutateAsync({ targetUserId: userId, updates }),

    banUser: (reason?: string) => banMutation.mutateAsync({ targetUserId: userId, reason }),

    unbanUser: () => unbanMutation.mutateAsync({ targetUserId: userId }),

    assignRole: (roleId: string) => assignRoleMutation.mutateAsync({ userId, roleId }),

    removeRole: (roleId: string) => removeRoleMutation.mutateAsync({ userId, roleId }),

    // حالات التحميل
    isUpdating: updateProfileMutation.isPending,
    isBanning: banMutation.isPending,
    isUnbanning: unbanMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,

    // أخطاء الطفرات
    updateError: updateProfileMutation.error,
    banError: banMutation.error,
    unbanError: unbanMutation.error,
    assignRoleError: assignRoleMutation.error,
    removeRoleError: removeRoleMutation.error,
  };
};
