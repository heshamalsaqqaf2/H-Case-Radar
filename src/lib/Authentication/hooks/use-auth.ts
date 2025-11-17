// hooks/use-auth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkUserSession, signInAction, signOutAction } from "@/lib/authentication/actions/auth-actions";

// تعريف نوع الجلسة
interface SessionData {
  user?: {
    id: string;
    email: string;
    accountStatus: string;
  };
}

// Hook Types
interface UseAuthReturn {
  session: SessionData | undefined; // تم إصلاح الخطأ: يجب أن يكون SessionData | undefined، وليس SessionData | null | undefined
  signIn: any; // سيتم إصلاح هذا
  signOut: any; // سيتم إصلاح هذا
  isLoading: boolean;
  isAuthenticated: boolean;
}

// تعريف نوع النتائج
interface SignInResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    accountStatus: string;
  };
  error?: string;
}

interface SignOutResult {
  success: boolean;
  message: string;
}

// Custom Hooks
export function useSession() {
  return useQuery<SessionData | null, Error>({
    queryKey: ["session"],
    queryFn: async () => {
      return await checkUserSession();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchInterval: 15000, // تقليل الوقت إلى 15 ثانية
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true, // الاستمرار في التحقق حتى في الخلفية
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation<SignInResult, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const result = await signInAction(null, formData);
      return result;
    },
    onSuccess: async (data) => {
      if (data.success) {
        // تحسين: قم بتحديث الكاش فورًا
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        await queryClient.invalidateQueries({ queryKey: ["account-status"] });
        toast.success(data.message);
      } else {
        toast.error("خطأ في تسجيل الدخول", {
          description: data.message,
        });
      }
    },
    onError: (error) => {
      toast.error("حدث خطأ", {
        description: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation<SignOutResult, Error, void>({
    mutationFn: async () => {
      const result = await signOutAction();
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["session"] });
        toast.success(data.message);
      } else {
        toast.error("خطأ في تسجيل الخروج", {
          description: data.message,
        });
      }
    },
    onError: (error) => {
      toast.error("حدث خطأ", {
        description: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    },
  });
}

export function useAuth(): UseAuthReturn {
  const sessionQuery = useSession();
  const signInMutation = useSignIn();
  const signOutMutation = useSignOut();

  return {
    session: sessionQuery.data ?? undefined, // تم إصلاح الخطأ: استخدام ?? undefined لضمان عدم إرجاع null
    signIn: signInMutation,
    signOut: signOutMutation,
    isLoading: sessionQuery.isLoading || signInMutation.isPending || signOutMutation.isPending,
    isAuthenticated: !!sessionQuery.data?.user,
  };
}

export function useAccountStatus() {
  return useQuery<SessionData | null, Error>({
    queryKey: ["account-status"],
    queryFn: async () => {
      return await checkUserSession();
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchInterval: 15000, // تقليل الوقت إلى 15 ثانية
    refetchOnWindowFocus: true,
  });
}
