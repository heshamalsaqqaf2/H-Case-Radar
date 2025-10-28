import { notFound } from "next/navigation";
import { EditRoleForm } from "@/components/admin/roles/edit-role-form";
import { ProtectedComponent } from "@/components/auth/protected-component";
import { getRoleProfileData } from "@/lib/authorization/actions/role-actions";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditRolePage({ params }: PageProps) {
  const { id } = await params;
  const roleData = await getRoleProfileData(id);

  if (!roleData) {
    notFound();
  }

  return (
    <ProtectedComponent permission="role.edit">
      <div className="container mx-auto p-6">
        <EditRoleForm role={roleData.role} permissions={roleData.permissions} />
      </div>
    </ProtectedComponent>
  );
}
