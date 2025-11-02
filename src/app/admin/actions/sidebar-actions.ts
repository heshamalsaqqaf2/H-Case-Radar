// src/actions/admin/sidebar-actions.ts
"use server";

import { authorizationService } from "@/lib/authentication/permission-system";
import { getCurrentUserId } from "@/lib/authentication/session";
import { adminNavItems } from "@/lib/utils/nav-config";
import type { NavItem } from "@/types/nav.types";

export async function getVisibleNavItems(): Promise<NavItem[]> {
  const userId = await getCurrentUserId();
  const userPermissions = await authorizationService.getUserPermissions(userId);
  const permissionNames = new Set(userPermissions.map((p) => p.name));

  return adminNavItems.filter(
    (item) =>
      !item.requiredPermission || permissionNames.has(item.requiredPermission),
  );
}
