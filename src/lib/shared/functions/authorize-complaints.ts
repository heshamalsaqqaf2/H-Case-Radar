import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import { Errors } from "@/lib/errors/error-factory";

export async function authorizeComplaints(
  context: string,
  requiredPermission: string,
  errorMessage?: string,
) {
  const check = await authorizationService.checkPermission({ userId: context }, requiredPermission);
  if (!check.allowed) {
    throw Errors.forbidden(errorMessage ?? "إدارة الشكاوى والبلاغات");
  }
}
