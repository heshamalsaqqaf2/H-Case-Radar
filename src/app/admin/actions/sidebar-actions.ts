"use server";

import { headers } from "next/headers";
import { getCurrentUserId } from "@/lib/authentication/session";
import { sidebarService } from "@/lib/authorization/services/admin/dashboard/sidebar-service";
import { Errors } from "@/lib/errors/error-factory";
import type { NavItem } from "@/types/nav.types";

/**
 * Server Action آمن لجلب عناصر الـ Sidebar المرئية
 * يُستخدم في AdminLayout لضمان التحقق من الخادم
 */
export async function getVisibleNavItems(): Promise<NavItem[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // جلب معلومات البيئة لدعم ABAC (اختياري لكن مؤسسي)
    const headersList = await headers();
    const environment = {
      ipAddress:
        headersList.get("x-forwarded-for") ?? headersList.get("remote-addr"),
      userAgent: headersList.get("user-agent"),
      tenantId: headersList.get("tenant-id"),
      time: new Date().toISOString(),
    };
    const navItems = await sidebarService.getVisibleSidebarItems(
      userId,
      environment,
    );
    return navItems;
  } catch (error) {
    const errorUserAgent = Errors.internal("فشل في استخراج معلومات العميل");
    console.error(errorUserAgent.message, error);
    return [];
    // return await sidebarService.getVisibleSidebarItems(null, {});
  }
}
