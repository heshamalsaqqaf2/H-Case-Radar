import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { requireMultiplePermissions } from "@/utils/has-authorization";

export default async function AdminDashboardPage() {
  // استخدام واحد
  // const authCheck = await requireAuthorization(
  //   AUDIT_LOG_ACTIONS.ADMIN.ACCESS,
  //   "ليس لديك صلاحية للوصول للأدوار",
  // );

  // if (authCheck !== true) return authCheck;

  // أو استخدام متعدد
  const multiCheck = await requireMultiplePermissions([
    { perm: AUDIT_LOG_ACTIONS.ADMIN.ACCESS, message: "لا يمكنك الوصول للوحة التحكم" },
    { perm: AUDIT_LOG_ACTIONS.ADMIN.VIEW, message: "لا يمكنك من عرض صفحات الوحة التحكم" },
  ]);

  if (multiCheck !== true) return multiCheck;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  );
}
