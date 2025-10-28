import { UsersManagement } from "@/components/admin/users-management";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function UsersPage() {
  return (
    <ProtectedComponent permission="user.view">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage system users and their roles
          </p>
        </div>
        <UsersManagement />
      </div>
    </ProtectedComponent>
  );
}
