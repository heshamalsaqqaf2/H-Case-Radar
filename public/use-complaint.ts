// // src/lib/complaints/hooks/use-complaint.ts
// "use client";

// import { queryOptions, useQuery } from "@tanstack/react-query";
// import { useAdminMutation } from "@/lib/authorization/hooks/core";
// import {
//   assignComplaintAction,
//   closeComplaintAction,
//   createComplaintAction,
//   deleteComplaintAction,
//   getAllComplaintsAction,
//   getComplaintByIdAction,
//   getComplaintProfileDataAction,
//   getComplaintStatsAction,
//   resolveComplaintAction,
//   updateComplaintAction,
// } fro./complaint-actionsons";
// import type { CreateComplaintInput, UpdateComplaintInput } fro../src/lib/authorization/types/complaintint";

// // ─── Query Options ───
// export const complaintsListOptions = (search?: string, status?: string, priority?: string) =>
//   queryOptions({
//     queryKey: ["complaints", "list", search, status, priority],
//     queryFn: () => getAllComplaintsAction(search, status, priority),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });

// export const complaintStatsOptions = queryOptions({
//   queryKey: ["complaints", "stats"],
//   queryFn: () => getComplaintStatsAction(),
//   staleTime: 2 * 60 * 1000,
//   gcTime: 5 * 60 * 1000,
// });

// const complaintProfileOptions = (complaintId: string) =>
//   queryOptions({
//     queryKey: ["complaints", "profile", complaintId],
//     queryFn: () => getComplaintProfileDataAction({ complaintId }),
//     enabled: !!complaintId,
//     staleTime: 2 * 60 * 1000,
//     gcTime: 5 * 60 * 1000,
//   });

// const complaintDetailOptions = (complaintId: string) =>
//   queryOptions({
//     queryKey: ["complaints", "detail", complaintId],
//     queryFn: () => getComplaintByIdAction({ complaintId }),
//     enabled: !!complaintId,
//     staleTime: 1 * 60 * 1000,
//     gcTime: 3 * 60 * 1000,
//   });

// // ─── Hooks: Queries ───
// export function useComplaintsList(search?: string, status?: string, priority?: string) {
//   return useQuery(complaintsListOptions(search, status, priority));
// }

// export function useComplaintStats() {
//   return useQuery(complaintStatsOptions);
// }

// export function useComplaintProfile(complaintId: string) {
//   return useQuery(complaintProfileOptions(complaintId));
// }

// export function useComplaintDetail(complaintId: string) {
//   return useQuery(complaintDetailOptions(complaintId));
// }

// // ─── Hooks: Mutations ───
// export function useCreateComplaint() {
//   return useAdminMutation<CreateComplaintInput>({
//     mutationFn: createComplaintAction,
//     invalidateKeys: [
//       ["complaints", "list"],
//       ["complaints", "stats"],
//     ],
//     successMessage: "تم إنشاء الشكوى بنجاح",
//     errorMessage: "خطأ في إنشاء الشكوى",
//   });
// }

// export function useUpdateComplaint() {
//   return useAdminMutation<UpdateComplaintInput>({
//     mutationFn: updateComplaintAction,
//     invalidateKeys: [
//       ["complaints", "list"],
//       ["complaints", "profile"],
//       ["complaints", "detail"],
//       ["complaints", "stats"],
//     ],
//     successMessage: "تم تحديث الشكوى بنجاح",
//     errorMessage: "خطأ في تحديث الشكوى",
//   });
// }

// export function useDeleteComplaint() {
//   return useAdminMutation<{ id: string }>({
//     mutationFn: deleteComplaintAction,
//     invalidateKeys: [
//       ["complaints", "list"],
//       ["complaints", "stats"],
//     ],
//     successMessage: "تم حذف الشكوى بنجاح",
//     errorMessage: "خطأ في حذف الشكوى",
//   });
// }

// export function useAssignComplaint() {
//   return useAdminMutation<{ complaintId: string; assignedTo: string }>({
//     mutationFn: assignComplaintAction,
//     invalidateKeys: [
//       ["complaints", "list"],
//       ["complaints", "profile"],
//       ["complaints", "detail"],
//     ],
//     successMessage: "تم تعيين الشكوى بنجاح",
//     errorMessage: "خطأ في تعيين الشكوى",
//   });
// }

// export function useResolveComplaint() {
//   return useAdminMutation<{ complaintId: string; resolutionNotes?: string }>({
//     mutationFn: resolveComplaintAction,
//     invalidateKeys: [
//       ["complaints", "list"],
//       ["complaints", "profile"],
//       ["complaints", "detail"],
//       ["complaints", "stats"],
//     ],
//     successMessage: "تم حل الشكوى بنجاح",
//     errorMessage: "خطأ في حل الشكوى",
//   });
// }

// export function useCloseComplaint() {
//   return useAdminMutation<{ complaintId: string }>({
//     mutationFn: closeComplaintAction,
//     invalidateKeys: [
//       ["complaints", "list"],
//       ["complaints", "profile"],
//       ["complaints", "detail"],
//       ["complaints", "stats"],
//     ],
//     successMessage: "تم إغلاق الشكوى بنجاح",
//     errorMessage: "خطأ في إغلاق الشكوى",
//   });
// }
