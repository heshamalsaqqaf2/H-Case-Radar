import { redirect } from "next/navigation";
import { PermissionsTable } from "@/app/admin/permissions/_components/permissions-table";
import { HeaderDashboardPage } from "@/components/admin/header-dashboard-page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCurrentUser } from "@/lib/authentication/session";

export default async function PermissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="space-y-6 px-6">
      <HeaderDashboardPage
        title="إدارة الصلاحيات"
        description="إدارة صلاحيات النظام وضوابط الوصول للمستخدمين"
        actions={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard" className="text-blue-500">
                  الرئيسيــة
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>إدارة الصلاحيات</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <PermissionsTable />
    </div>
  );
}
