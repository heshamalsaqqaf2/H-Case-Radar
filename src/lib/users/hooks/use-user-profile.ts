"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserProfileAction, updateUserProfileAction } from "../actions/user-actions";
import type { UpdateUserProfileInput } from "../validators/user-validator";

export const userProfileOptions = queryOptions({
  queryKey: ["user", "profile"],
  queryFn: () => getUserProfileAction(),
  staleTime: 5 * 60 * 1000,
});

export function useUserProfile() {
  return useQuery(userProfileOptions);
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => updateUserProfileAction(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.data?.message || "تم التحديث بنجاح");
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : result.error?.userMessage || result.error?.message || "حدث خطأ أثناء التحديث";
        toast.error(errorMessage);
      }
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ غير متوقع");
    },
  });
}
