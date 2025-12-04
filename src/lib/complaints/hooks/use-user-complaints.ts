"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { getUserAssignedComplaintsAction } from "@/lib/complaints/actions/user-complaints-actions";

export const userAssignedComplaintsOptions = (pageSize?: number, cursor?: string) =>
  queryOptions({
    queryKey: ["complaints", "user-assigned", { pageSize, cursor }],
    queryFn: () => getUserAssignedComplaintsAction(pageSize, cursor),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    refetchOnMount: true,
  });

export function useUserAssignedComplaints(pageSize?: number, cursor?: string) {
  return useQuery(userAssignedComplaintsOptions(pageSize, cursor));
}
