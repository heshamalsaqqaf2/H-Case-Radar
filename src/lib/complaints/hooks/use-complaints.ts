"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/lib/authorization/hooks/core";

import {
  addCommentAction,
  assignComplaintAction,
  closeComplaintAction,
  createComplaintAction,
  deleteComplaintAction,
  escalateComplaintAction,
  getAllComplaintsAction,
  getAssignableUsersAction,
  getComplaintByIdAction,
  getComplaintProfileDataAction,
  getComplaintStatsAction,
  reopenComplaintAction,
  resolveComplaintAction,
  updateComplaintAction,
  updateEscalationLevelComplaintAction,
} from "@/lib/complaints/actions/complaints-actions"

import type {
  ComplaintEscalationLevelType,
  CreateComplaintInput,
  UpdateComplaintInput,
} from "@/lib/complaints/types/type-complaints";

// Query Options factory
export const complaintsListOptions = (
  search?: string,
  status?: string,
  priority?: string,
  category?: string,
  tags?: string[],
  pageSize?: number,
  cursor?: string,
) =>
  queryOptions({
    queryKey: [
      "complaints",
      "list",
      { search, status, priority, category, tags, pageSize, cursor },
    ],
    queryFn: () =>
      getAllComplaintsAction(search, status, priority, category, tags, pageSize, cursor),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    refetchOnMount: true,
  });

export const complaintStatsOptions = queryOptions({
  queryKey: ["complaints", "stats"],
  queryFn: () => getComplaintStatsAction(),
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  retry: 1,
});

const complaintProfileOptions = (complaintId: string) =>
  queryOptions({
    queryKey: ["complaints", "profile", complaintId],
    queryFn: () => getComplaintProfileDataAction({ complaintId }),
    enabled: !!complaintId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

const complaintDetailOptions = (complaintId: string) =>
  queryOptions({
    queryKey: ["complaints", "detail", complaintId],
    queryFn: () => getComplaintByIdAction({ complaintId }),
    enabled: !!complaintId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

const assignableUsersOptions = queryOptions({
  queryKey: ["complaints", "assignable-users"],
  queryFn: () => getAssignableUsersAction(),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
});

// Hooks: Queries
export function useComplaintsList(
  search?: string,
  status?: string,
  priority?: string,
  category?: string,
  tags?: string[],
  pageSize?: number,
  cursor?: string,
) {
  return useQuery(
    complaintsListOptions(search, status, priority, category, tags, pageSize, cursor),
  );
}

export function useComplaintStats() {
  return useQuery(complaintStatsOptions);
}

export function useComplaintProfile(complaintId: string) {
  return useQuery(complaintProfileOptions(complaintId));
}

export function useComplaintDetail(complaintId: string) {
  return useQuery(complaintDetailOptions(complaintId));
}

export function useAssignableUsers() {
  return useQuery(assignableUsersOptions);
}

// Hooks: Mutations — using your useAdminMutation wrapper that integrates server Actions
export function useCreateComplaint() {
  return useAdminMutation<CreateComplaintInput>({
    mutationFn: createComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "stats"],
    ],
    successMessage: "تم إنشاء الشكوى بنجاح",
    errorMessage: "خطأ في إنشاء الشكوى",
  });
}

export function useUpdateComplaint() {
  return useAdminMutation<UpdateComplaintInput>({
    mutationFn: updateComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "profile"],
      ["complaints", "detail"],
      ["complaints", "stats"],
    ],
    successMessage: "تم تحديث الشكوى بنجاح",
    errorMessage: "خطأ في تحديث الشكوى",
  });
}

export function useDeleteComplaint() {
  return useAdminMutation<{ id: string }>({
    mutationFn: deleteComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "stats"],
    ],
    successMessage: "تم حذف الشكوى بنجاح",
    errorMessage: "خطأ في حذف الشكوى",
  });
}

export function useAssignComplaint() {
  return useAdminMutation<{ complaintId: string; assignedTo: string }>({
    mutationFn: assignComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "profile"],
      ["complaints", "detail"],
    ],
    successMessage: "تم تعيين الشكوى بنجاح",
    errorMessage: "خطأ في تعيين الشكوى",
  });
}

export function useResolveComplaint() {
  return useAdminMutation<{ complaintId: string; resolutionNotes?: string }>({
    mutationFn: resolveComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "profile"],
      ["complaints", "detail"],
      ["complaints", "stats"],
    ],
    successMessage: "تم حل الشكوى بنجاح",
    errorMessage: "خطأ في حل الشكوى",
  });
}

export function useCloseComplaint() {
  return useAdminMutation<{ complaintId: string }>({
    mutationFn: closeComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "profile"],
      ["complaints", "detail"],
      ["complaints", "stats"],
    ],
    successMessage: "تم إغلاق الشكوى بنجاح",
    errorMessage: "خطأ في إغلاق الشكوى",
  });
}

export function useReopenComplaint() {
  return useAdminMutation<{ complaintId: string; reason: string }>({
    mutationFn: reopenComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "profile"],
      ["complaints", "detail"],
      ["complaints", "stats"],
    ],
    successMessage: "تم إعادة فتح الشكوى بنجاح",
    errorMessage: "خطأ في إعادة فتح الشكوى",
  });
}

export function useEscalateComplaint() {
  return useAdminMutation<{ complaintId: string; level: ComplaintEscalationLevelType }>({
    mutationFn: escalateComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "profile"],
      ["complaints", "detail"],
      ["complaints", "stats"],
    ],
    successMessage: "تم تصعيد الشكوى بنجاح",
    errorMessage: "خطأ في تصعيد الشكوى",
  });
}

export function useupdateEscalationComplaintLevel() {
  return useAdminMutation<{ complaintId: string; level: ComplaintEscalationLevelType }>({
    mutationFn: updateEscalationLevelComplaintAction,
    invalidateKeys: [
      ["complaints", "list"],
      ["complaints", "profile"],
      ["complaints", "detail"],
      ["complaints", "stats"],
    ],
    successMessage: "تم تصعيد الشكوى بنجاح",
    errorMessage: "خطأ في تصعيد الشكوى",
  });
}

export function useAddComment() {
  return useAdminMutation<{ complaintId: string; body: string }>({
    mutationFn: addCommentAction,
    invalidateKeys: [
      ["complaints", "profile"],
      ["complaints", "detail"],
    ],
    successMessage: "تم إضافة التعليق بنجاح",
    errorMessage: "خطأ في إضافة التعليق",
  });
}
