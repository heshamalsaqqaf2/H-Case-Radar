// src/lib/authorization/hooks/core/use-current-user.ts
"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCurrentUserPermissionsAction } from "@/lib/authorization/actions/admin/permission-actions";
import { getCurrentUserAction } from "@/lib/authorization/actions/admin/user-actions";

const currentUserOptions = () =>
  queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUserAction(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

const currentUserPermissionsOptions = () =>
  queryOptions({
    queryKey: ["currentUserPermissions"],
    queryFn: () => getCurrentUserPermissionsAction(),
    staleTime: 5 * 60 * 1000,
  });

export function useCurrentUser() {
  return useQuery(currentUserOptions());
}

export function useCurrentUserPermissions() {
  return useQuery(currentUserPermissionsOptions());
}
