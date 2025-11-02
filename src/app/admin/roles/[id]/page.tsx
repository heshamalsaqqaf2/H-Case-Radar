import { notFound, redirect } from "next/navigation";
import { EditRoleForm } from "@/components/admin/roles/edit-role-form";
import { authorizationService } from "@/lib/authentication/permission-system";
import { getCurrentUserId } from "@/lib/authentication/session";
import { getRoleProfileData } from "@/lib/authorization/actions/admin/role-actions";

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
    "role.update",
  );
  if (!check.allowed) {
    redirect("/unauthorized");
  }

  const roleData = await getRoleProfileData(id);
  if (!roleData) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <EditRoleForm role={roleData.role} permissions={roleData.permissions} />
    </div>
  );
}
