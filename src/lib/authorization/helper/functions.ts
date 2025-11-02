import type { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authorizationService } from "@/lib/authentication/permission-system";
import { Errors } from "@/lib/errors/error-factory";

// TODO: =============== دوال مساعدة داخلية ===============
// دالة مساعدة للتحقق من صلاحية الكتابة
export const handleMutationSuccess = (
  result: {
    success: boolean;
    data?: { message: string };
    error?: { message: string };
  },
  invalidateKey: string[],
  queryClient: ReturnType<typeof useQueryClient>,
  successMessage: string,
  errorMessagePrefix: string,
) => {
  if (result.success) {
    queryClient.invalidateQueries({ queryKey: invalidateKey });
    toast.success(result.data?.message || successMessage);
  } else {
    toast.error(errorMessagePrefix, {
      description: result.error?.message || "حدث خطأ غير متوقع",
    });
  }
};

// دالة مساعدة للتحقق من صلاحية القراءة
export async function authorizeForRead(userId: string) {
  const check = await authorizationService.checkPermission(
    { userId },
    "permissions.read",
  );
  if (!check.allowed) {
    throw Errors.forbidden("عرض الصلاحيات");
  }
}
