import { DashboardStats } from "@/components/admin/dashboard-stats";
import { QuickActions } from "@/components/admin/quick-actions";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function AdminDashboard() {
  return (
    <ProtectedComponent permission="admin.dashboard.view">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
          <p className="mt-2">
            مرحبا بك في لوحة تحكم الإدارة, يمكنك إدارة المستخدمين والصلاحيات
            والأدوار
          </p>
        </div>

        <DashboardStats />
        <QuickActions />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-blue-200 rounded-lg p-4">
            <h3 className="font-semiboldmb-2">System Status</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Authentication: Working</li>
              <li>✅ Permissions: Loaded</li>
              <li>✅ Database: Connected</li>
              <li>✅ Admin Access: Granted</li>
            </ul>
          </div>

          <div className="border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Quick Links</h3>
            <ul className="text-sm space-y-1">
              <li>
                •{" "}
                <a
                  href="/admin/users"
                  className="text-green-700 hover:underline"
                >
                  Manage Users
                </a>
              </li>
              <li>
                •{" "}
                <a
                  href="/admin/roles"
                  className="text-green-700 hover:underline"
                >
                  Manage Roles
                </a>
              </li>
              <li>
                •{" "}
                <a
                  href="/admin/permissions"
                  className="text-green-700 hover:underline"
                >
                  View Permissions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedComponent>
  );
}
