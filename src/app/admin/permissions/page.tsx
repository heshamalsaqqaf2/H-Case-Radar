import { redirect } from "next/navigation";
import { CreatePermissionForm } from "@/components/admin/permissions/create-permission-form";
import { PermissionsTable } from "@/components/admin/permissions/permissions-table";
import { getCurrentUser } from "@/lib/authentication/session";

export default async function PermissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="container mx-auto p-0 space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="">
          <h1 className="text-3xl">الصلاحيات والأذونات</h1>
          <p className="">إدارة صلاحيات النظام وضوابط الوصول للمستخدمين</p>
        </div>
        <div className="">
          <CreatePermissionForm />
        </div>
      </div>
      <div className="pt-5 pb-5 pe-3 pr-3">{/* <PermissionsTable /> */}</div>
    </div>
  );
}
