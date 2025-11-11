// src/app/admin/debug/permissions-debug.tsx
"use server";

import { getCurrentUserId } from "@/lib/authentication/session";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";

interface PermissionResult {
  permission: string;
  resource: string;
  action: string;
  allowed: boolean;
  reason: string;
}

interface DebugResult {
  userId?: string;
  results?: PermissionResult[];
  summary?: {
    total: number;
    allowed: number;
    denied: number;
  };
  error?: string;
}

export async function debugUserPermissions(): Promise<DebugResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "No user ID found" };
    }

    console.log("🔍 Debugging permissions for user:", userId);

    const permissionsToCheck = [
      AUDIT_LOG_ACTIONS.DASHBOARD.VIEW,
      AUDIT_LOG_ACTIONS.USER.VIEW,
      AUDIT_LOG_ACTIONS.ROLE.VIEW,
      AUDIT_LOG_ACTIONS.PERMISSION.VIEW,
      AUDIT_LOG_ACTIONS.AUDIT_LOG.VIEW,
      AUDIT_LOG_ACTIONS.STATISTICS.VIEW,
    ];

    const results: PermissionResult[] = [];

    for (const permission of permissionsToCheck) {
      const [resource, action] = permission.split(".") as [string, string];

      const check = await authorizationService.canPerformAction({
        userId,
        resource,
        action,
        environment: {},
      });

      results.push({
        permission,
        resource,
        action,
        allowed: check.allowed,
        reason: check.allowed ? "✅ مسموح" : `❌ مرفوض: ${check.reason}`,
      });

      console.log(
        `🔐 ${permission}: ${check.allowed ? "✅" : "❌"} - ${check.reason}`,
      );
    }

    return {
      userId,
      results,
      summary: {
        total: results.length,
        allowed: results.filter((r) => r.allowed).length,
        denied: results.filter((r) => !r.allowed).length,
      },
    };
  } catch (error) {
    console.error("❌ Error in debugUserPermissions:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
