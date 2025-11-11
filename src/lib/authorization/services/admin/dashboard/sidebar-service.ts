import { unstable_cache } from "next/cache";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import type { NavItem } from "@/types/nav.types";

/**
 * خدمة احترافية لإدارة عناصر شريط التصفح في لوحة التحكم
 * تُطبّق مبادئ RBAC/ABAC المؤسسية:
 * - كل بند مرتبط بـ resource.action (مثل role.access)
 * - التحقق يتم عبر محرك الصلاحيات المركزي
 * - يدعم التوسع عبر إضافة عناصر جديدة دون تعديل المنطق
 */
export class SidebarService {
  /**
   * يُرجع قائمة العناصر المرئية للمستخدم بناءً على صلاحياته
   * @param userId معرف المستخدم الحالي
   * @param environment سياق ABAC (مثل: ipAddress, time, tenantId)
   * @returns قائمة من العناصر المسموح بها
   */
  async getVisibleSidebarItems(
    userId: string,
    environment: Record<string, unknown> = {},
  ): Promise<NavItem[]> {
    return unstable_cache(
      async () => {
        // الكود الحالي
        console.log(`🔄 Loading sidebar for user: ${userId}`);
        const startTime = Date.now();

        const config = this.getSidebarConfig();
        const visibleItems = [];

        for (const item of config) {
          // تفكيك action إلى resource و action (مثال: "role.access" → resource="role", action="access")
          const [resource, action] = item.requiredAction.split(".") as [string, string];
          const check = await authorizationService.canPerformAction({
            userId,
            resource,
            action,
            environment,
          });
          console.log(
            `🔐 Permission check: ${item.requiredAction} - ${check.allowed ? "✅" : "❌"}`,
          );
          if (check.allowed) {
            visibleItems.push({
              title: item.title,
              href: item.href,
              icon: item.icon,
            });
          }
        }
        const duration = Date.now() - startTime;
        console.log(`✅ Sidebar loaded in ${duration}ms with ${visibleItems.length} items`);
        // تتبع الاستخدام
        await this.trackSidebarUsage(userId, visibleItems.length);

        return visibleItems;
      },
      [`sidebar-items-${userId}`],
      {
        revalidate: 300, // 5 دقائق
        tags: [`sidebar-${userId}`],
      },
    )();
  }

  /**
   * تكوين ثابت للـ Sidebar — قابل للتوسع دون تعديل المنطق
   * يُستخدم في المؤسسات الكبيرة لفصل التكوين عن التنفيذ
   */
  private getSidebarConfig(): Array<{
    title: string;
    href: string;
    icon: string;
    requiredAction: string; // resource.action
    order: number;
  }> {
    return [
      {
        title: "لوحة التحكم",
        href: "/admin/dashboard",
        icon: "LayoutDashboard",
        requiredAction: AUDIT_LOG_ACTIONS.ADMIN.ACCESS,
        order: 1,
      },
      {
        title: "المستخدمون",
        href: "/admin/users",
        icon: "Users",
        requiredAction: AUDIT_LOG_ACTIONS.USER.ACCESS,
        order: 2,
      },
      {
        title: "الأدوار",
        href: "/admin/roles",
        icon: "ShieldCheck",
        requiredAction: AUDIT_LOG_ACTIONS.ROLE.ACCESS,
        order: 3,
      },
      {
        title: "الصلاحيات",
        href: "/admin/permissions",
        icon: "KeyRound",
        requiredAction: AUDIT_LOG_ACTIONS.PERMISSION.ACCESS,
        order: 4,
      },
      {
        title: "السجلات الأمنية",
        href: "/admin/audit-logs",
        icon: "ScrollText",
        requiredAction: AUDIT_LOG_ACTIONS.AUDIT_LOG.ACCESS,
        order: 5,
      },
      {
        title: "الإحصائيات",
        href: "/admin/statistics",
        icon: "BarChart3",
        requiredAction: AUDIT_LOG_ACTIONS.STATISTICS.ACCESS,
        order: 6,
      },
    ].sort((a, b) => a.order - b.order);
  }
  /**
   * تتبع استخدام الـ Sidebar (يمكن تطويره ليرسل لإحصائيات)
   */
  private async trackSidebarUsage(userId: string, itemCount: number): Promise<void> {
    try {
      console.log(`📊 Sidebar Usage - User: ${userId}, Items: ${itemCount}`);
      // يمكنك هنا:
      // 1. إرسال بيانات لخدمة تحليلات (Google Analytics, etc.)
      // 2. حفظ في قاعدة البيانات
      // 3. إرسال لإحصائيات داخلية
    } catch (error) {
      console.error("Failed to track sidebar usage:", error);
      // لا نرمي خطأ هنا حتى لا نؤثر على تجربة المستخدم
    }
  }
}

export const sidebarService = new SidebarService();
