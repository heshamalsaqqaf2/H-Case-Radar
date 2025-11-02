"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCurrentUser,
  getUserPermissions,
} from "@/lib/authorization/actions/admin/auth-actions";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("🔄 useCurrentUser called");
      const user = await getCurrentUser();
      console.log("✅ useCurrentUser result:", user);
      return user;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useUserPermissions(userId?: string) {
  return useQuery({
    queryKey: ["userPermissions", userId],
    queryFn: async () => {
      if (!userId) {
        toast.error("خطأ", { description: "لم يتم تحديد معرف المستخدم" });
        console.log("❌ useUserPermissions - No userId provided");
        return [];
      }
      console.log("🔄 useUserPermissions called for userId:", userId);
      const permissions = await getUserPermissions(userId);
      console.log("✅ useUserPermissions result count:", permissions.length);
      return permissions;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}
