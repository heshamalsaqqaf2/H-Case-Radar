// src/app/admin/roles/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { EditRoleForm } from "@/app/admin/roles/components/edit-role-form";
import { getCurrentUserId } from "@/lib/authentication/session";
import { getRoleProfileDataAction } from "@/lib/authorization/actions/admin/role-actions";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditRolePage({ params }: PageProps) {
  const { id } = await params;

  const userId = await getCurrentUserId();
  const check = await authorizationService.checkPermission(
    { userId },
    AUDIT_LOG_ACTIONS.ROLE.UPDATE,
  );

  if (!check.allowed) {
    redirect("/unauthorized");
  }

  const roleResult = await getRoleProfileDataAction({ roleId: id });

  if (!roleResult.success || !roleResult.data) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <EditRoleForm
        role={roleResult.data.role}
        permissions={roleResult.data.permissions}
      />
    </div>
  );
}
