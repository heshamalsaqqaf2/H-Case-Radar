// src/lib/authorization/hooks/core/use-admin-mutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MutationConfig<TVariables> {
  mutationFn: (variables: TVariables) => Promise<{
    success: boolean;
    data?: { message: string };
    error?: { message: string };
  }>;
  invalidateKeys?: string[][];
  successMessage: string;
  errorMessage: string;
}

export function useAdminMutation<TVariables>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage,
}: MutationConfig<TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      if (result.success) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
        toast.success(result.data?.message || successMessage);
      } else {
        toast.error(errorMessage, {
          description: result.error?.message || "حدث خطأ غير متوقع",
        });
      }
    },
    onError: (error: unknown) => {
      let message = "يرجى المحاولة لاحقًا";
      if (error instanceof Error) {
        message = error.message || message;
      }
      toast.error("خطأ غير متوقع", { description: message });
    },
  });
}
