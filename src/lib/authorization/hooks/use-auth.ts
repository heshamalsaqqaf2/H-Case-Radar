// lib/hooks/use-auth.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCurrentUser,
  getUserPermissions,
} from "@/lib/authorization/actions/auth-actions";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("🔄 useCurrentUser queryFn called");
      const user = await getCurrentUser();
      console.log("✅ useCurrentUser result:", user);
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 دقائق
    retry: 2,
    retryDelay: 1000,
  });
}

export function useUserPermissions(userId?: string) {
  return useQuery({
    queryKey: ["userPermissions", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("❌ useUserPermissions - No userId provided");
        return [];
      }
      console.log("🔄 useUserPermissions called for userId:", userId);
      const permissions = await getUserPermissions(userId);
      console.log("✅ useUserPermissions result count:", permissions.length);
      return permissions;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 دقائق
  });
}
