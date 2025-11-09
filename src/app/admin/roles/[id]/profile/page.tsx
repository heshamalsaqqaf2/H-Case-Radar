// src/app/admin/roles/[id]/profile/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RoleActivity } from "@/app/admin/roles/[id]/profile/components/role-activity";
import { RoleHeader } from "@/app/admin/roles/[id]/profile/components/role-header";
import { QuickLoading } from "@/components/quick-loading";
import { getRoleProfileDataAction } from "@/lib/authorization/actions/admin/role-actions";
import { RolePermissionsManager } from "../../components/role-permissions-manager";
import { RoleUsers } from "../../components/role-users";

interface PageProps {
  params: {
    id: string;
  };
}

// مكونات التحميل
function PermissionsLoading() {
  return <QuickLoading message="جاري تحميل الصلاحيات..." />;
}

function ActivityLoading() {
  return <QuickLoading message="جاري تحميل النشاط..." />;
}

function UsersLoading() {
  return <QuickLoading message="جاري تحميل المستخدمين..." />;
}

export default async function RoleProfilePage({ params }: PageProps) {
  const { id } = await params;

  // جلب البيانات مرة واحدة فقط
  const profileResult = await getRoleProfileDataAction({ roleId: id });

  if (!profileResult.success || !profileResult.data) {
    notFound();
  }

  const { role, permissions, users, statistics, activity } = profileResult.data;

  return (
    <div className="container mx-auto p-6">
      {/* رأس الصفحة */}
      <div className="mb-6 text-right">
        <h1 className="text-3xl font-bold mb-2">معلومات الدور</h1>
        <p className="text-foreground">
          واجهة سريعة وفعالة لإدارة الأدوار, وعرض جميع بيانات الدور.
        </p>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* رأس الدور */}
        <RoleHeader roleId={id} initialData={{ role, statistics }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الأيسر - الصلاحيات والمستخدمين */}
          <div className="lg:col-span-2 space-y-6">
            {/* مدير الصلاحيات */}
            <Suspense fallback={<PermissionsLoading />}>
              <RolePermissionsManager
                role={{
                  id: role.id,
                  name: role.name,
                }}
                initialPermissions={permissions}
              />
            </Suspense>

            {/* المستخدمون المعينون */}
            <Suspense fallback={<UsersLoading />}>
              <RoleUsers roleId={id} initialUsers={users} />
            </Suspense>
          </div>

          {/* العمود الأيمن - النشاط */}
          <div className="space-y-6">
            <Suspense fallback={<ActivityLoading />}>
              <RoleActivity roleId={id} initialActivity={activity} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
