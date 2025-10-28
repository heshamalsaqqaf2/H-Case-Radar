import { CreateRoleForm } from "@/components/admin/roles/create-role-form";
import { RolesTable } from "@/components/admin/roles/roles-table";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function RolesPage() {
  return (
    <ProtectedComponent permission="role.view">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الأدوار</h1>
          <p className="text-gray-600 mt-2">
            إنشاء وإدارة أدوار النظام وأذوناتها
          </p>
        </div>
        <ProtectedComponent permission="role.create">
          <CreateRoleForm />
        </ProtectedComponent>
      </div>
      <RolesTable />
    </ProtectedComponent>
  );
}
