import { CreatePermissionForm } from "@/components/admin/permissions/create-permission-form";
import { PermissionsTable } from "@/components/admin/permissions/permissions-table";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function PermissionsPage() {
  return (
    <ProtectedComponent permission="permission.view">
      <div className="container mx-auto p-0 space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="">
            <h1 className="text-3xl">الصلاحيات والأذونات</h1>
            <p className="">إدارة صلاحيات النظام وضوابط الوصول للمستخدمين</p>
          </div>
          <div className="">
            <ProtectedComponent permission="permission.create">
              <CreatePermissionForm />
            </ProtectedComponent>
          </div>
        </div>
        <div className="pt-5 pb-5 pe-3 pr-3">
          <PermissionsTable />
        </div>
      </div>
    </ProtectedComponent>
  );
}
