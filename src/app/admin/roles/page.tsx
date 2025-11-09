// src/app/admin/roles/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/authentication/session";
import { getAllRolesAction } from "@/lib/authorization/actions/admin/role-actions";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import { CreateRoleForm } from "./components/create-role-form";
import { RolesTable } from "./components/roles-table";

export default async function RolesPage() {
  const userId = await getCurrentUserId();
  if (!userId) return redirect("/sign-in");

  const hasAccessRole = await authorizationService.checkPermission(
    { userId },
    AUDIT_LOG_ACTIONS.ROLE.ACCESS,
  );

  const hasViewRole = await authorizationService.checkPermission(
    { userId },
    AUDIT_LOG_ACTIONS.ROLE.VIEW,
  );

  const hasCreatePermission = await authorizationService.checkPermission(
    { userId },
    AUDIT_LOG_ACTIONS.ROLE.CREATE,
  );

  if (!hasAccessRole.allowed) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">غير مصرح</h1>
        <p className="text-gray-600 mt-2">ليس لديك صلاحية للوصول للأدوار</p>
      </div>
    );
  }
  if (!hasViewRole.allowed) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">غير مصرح</h1>
        <p className="text-gray-600 mt-2">ليس لديك صلاحية لعرض الأدوار</p>
      </div>
    );
  }

  const rolesResult = await getAllRolesAction();
  const initialRoles = rolesResult.success ? rolesResult.data : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة الأدوار</h1>
        <p className="text-gray-600 mt-2">إنشاء وإدارة أدوار النظام وأذوناتها</p>
      </div>

      {hasCreatePermission.allowed && <CreateRoleForm />}

      <RolesTable initialRoles={initialRoles} />
    </div>
  );
}
