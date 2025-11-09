import { redirect } from "next/navigation";
import { getUnauthorizedComponent } from "@/components/shared/authorization-ui/unauthorized-card";
import { getCurrentUserId } from "@/lib/authentication/session";
import type { AuditAction } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";

interface PermissionCheck {
  perm: AuditAction;
  message?: string;
}

/**
 * التحقق من صلاحية واحدة
 */
export async function requireAuthorization(
  requiredPermission: AuditAction,
  errorMessage?: string,
): Promise<true | React.ReactNode> {
  const userId = await getCurrentUserId();
  if (!userId) return redirect("/sign-in");

  const result = await authorizationService.checkPermission({ userId }, requiredPermission);
  if (!result.allowed) {
    return getUnauthorizedComponent(errorMessage);
  }
  return true;
}

/**
 * التحقق من عدة صلاحيات مرة واحدة
 */
export async function requireMultiplePermissions(
  permissions: PermissionCheck[],
): Promise<true | React.ReactNode> {
  const userId = await getCurrentUserId();
  if (!userId) return redirect("/sign-in");

  for (const { perm, message } of permissions) {
    const result = await authorizationService.checkPermission({ userId }, perm);

    if (!result.allowed) {
      return getUnauthorizedComponent(message);
    }
  }

  return true;
}
