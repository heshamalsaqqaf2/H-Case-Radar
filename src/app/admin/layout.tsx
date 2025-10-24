import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedComponent permission="admin.dashboard.view">
      <div className="min-h-screen">
        <AdminNavbar />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ProtectedComponent>
  );
}
