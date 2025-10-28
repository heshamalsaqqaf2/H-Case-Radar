import { notFound } from "next/navigation";
import { EditPermissionForm } from "@/components/admin/permissions/edit-permission-form";
import { ProtectedComponent } from "@/components/auth/protected-component";
import { getPermissionById } from "@/lib/authorization/actions/permission/permission-actions";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditPermissionPage({ params }: PageProps) {
  const { id } = await params;
  const permissionId = await getPermissionById(id);

  if (!permissionId) {
    notFound();
  }

  return (
    <ProtectedComponent permission="permission.edit">
      <div className="container mx-auto p-6">
        <EditPermissionForm permission={permissionId} />
      </div>
    </ProtectedComponent>
  );
  // return (
  //   <ProtectedComponent permission="permission.edit">
  //     <div className="container mx-auto p-6">
  //       <EditPermissionForm permission={permissionId as SafePermission} />
  //     </div>
  //   </ProtectedComponent>
  // );
}
