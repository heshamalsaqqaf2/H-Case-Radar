import { notFound } from "next/navigation";
import { EditPermissionForm } from "@/components/admin/permissions/edit-permission-form";
import { getPermissionById } from "@/lib/authorization/services/admin/permission-service";

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
    <div className="container mx-auto p-6">
      <EditPermissionForm permission={permissionId} />
    </div>
  );
}
