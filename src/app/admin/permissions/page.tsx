import { CreatePermissionForm } from "@/components/admin/permissions/create-permission-form";
import { PermissionsTable } from "@/components/admin/permissions/permissions-table";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function PermissionsPage() {
  return (
    <ProtectedComponent permission="permission.view">
      <div className="container mx-auto p-0 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Permissions</h1>
          <p className="text-gray-600">
            Manage system permissions and access controls
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PermissionsTable />
          </div>
          <div className="lg:col-span-1">
            <ProtectedComponent permission="permission.create">
              <CreatePermissionForm />
            </ProtectedComponent>
          </div>
        </div>
      </div>
    </ProtectedComponent>
  );
}
