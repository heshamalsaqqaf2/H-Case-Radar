import { notFound } from "next/navigation";
import { EditRoleForm } from "@/components/admin/roles/edit-role-form";
import { ProtectedComponent } from "@/components/auth/protected-component";
import { getRoleWithPermissions } from "@/lib/actions/role-actions";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditRolePage({ params }: PageProps) {
  // انتظار params أولاً
  const { id } = await params;
  const role = await getRoleWithPermissions(id);

  if (!role) {
    notFound();
  }

  return (
    <ProtectedComponent permission="role.edit">
      <div className="container mx-auto p-6">
        <EditRoleForm role={role} />
      </div>
    </ProtectedComponent>
  );
}
