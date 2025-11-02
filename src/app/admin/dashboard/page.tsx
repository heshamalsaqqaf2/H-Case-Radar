import { QuickActions } from "@/components/admin/main/quick-actions";
import { DashboardStats } from "@/components/admin/layouts-admin/dashboard-stats";
// import { ProtectedComponent } from "@/components/auth/protected-component";

export default function AdminDashboard() {
  return (
    // <P permission="admin.dashboard.view">
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
        <p className="mt-2">
          مرحبا بك في لوحة تحكم الإدارة, يمكنك إدارة المستخدمين والصلاحيات
          والأدوار
        </p>
      </div>
      <DashboardStats />
      <QuickActions />
    </div>
    // </P  rotectedComponent>
  );
}
