import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RoleActivity } from "@/components/admin/roles/role-profile/role-activity";
import { RoleHeader } from "@/components/admin/roles/role-profile/role-header";
import { RolePermissionsManager } from "@/components/admin/roles/role-permissions-manager";
import { RoleUsers } from "@/components/admin/roles/role-users";
import { ProtectedComponent } from "@/components/auth/protected-component";
import { QuickLoading } from "@/components/quick-loading";
import { getRoleProfileData } from "@/lib/authorization/actions/admin/role-actions";

interface PageProps {
  params: {
    id: string;
  };
}

// مكون محسن للتحميل الأولي
function ProfilePageContent({ roleId }: { roleId: string }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <RoleHeader roleId={roleId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense
            fallback={<QuickLoading message="Loading permissions..." />}
          >
            <RolePermissionsManagerWrapper roleId={roleId} />
          </Suspense>
          <RoleUsers roleId={roleId} />
        </div>

        <div className="space-y-6">
          <Suspense fallback={<QuickLoading message="Loading activity..." />}>
            <RoleActivity roleId={roleId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Wrapper component للـ RolePermissionsManager
async function RolePermissionsManagerWrapper({ roleId }: { roleId: string }) {
  const data = await getRoleProfileData(roleId);
  if (!data) return null;

  return (
    <RolePermissionsManager
      role={{
        id: data.role.id,
        name: data.role.name,
      }}
      initialPermissions={data.permissions}
    />
  );
}

export default async function RoleProfilePage({ params }: PageProps) {
  // انتظار params أولاً
  const { id } = await params;
  const profileData = await getRoleProfileData(id);
  if (!profileData) {
    notFound();
  }

  return (
    <ProtectedComponent permission="role.view">
      <div className="container mx-auto p-6">
        {/* رأس الصفحة */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Role Profile
          </h1>
          <p className="text-gray-600">
            Fast and efficient role management interface
          </p>
        </div>

        {/* المحتوى الرئيسي */}
        <Suspense
          fallback={
            <div className="space-y-6">
              <QuickLoading message="Loading role profile..." speed="smooth" />
            </div>
          }
        >
          <ProfilePageContent roleId={id} />
        </Suspense>
      </div>
    </ProtectedComponent>
  );
}

// import { notFound } from "next/navigation";
// import { RoleActivity } from "@/components/admin/roles/role-activity";
// import { RoleHeader } from "@/components/admin/roles/role-header";
// import { RolePermissionsManager } from "@/components/admin/roles/role-permissions-manager";
// import { RoleUsers } from "@/components/admin/roles/role-users";
// import { ProtectedComponent } from "@/components/auth/protected-component";
// import { getRoleWithPermissions } from "@/lib/actions/role-actions";

// interface PageProps {
//   params: {
//     id: string;
//   };
// }

// export default async function RoleProfilePage({ params }: PageProps) {
//   const role = await getRoleWithPermissions(params.id);

//   if (!role) {
//     notFound();
//   }

//   return (
//     <ProtectedComponent permission="role.view">
//       <div className="container mx-auto p-6 space-y-6">
//         {/* رأس الصفحة */}
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Role Profile
//           </h1>
//           <p className="text-gray-600">
//             Comprehensive overview of the role, its permissions, and assigned
//             users
//           </p>
//         </div>

//         {/* رأس الدور */}
//         <RoleHeader roleId={params.id} />

//         {/* الشبكة الرئيسية */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* العمود الأيسر - الصلاحيات */}
//           <div className="lg:col-span-2 space-y-6">
//             <RolePermissionsManager role={role} />
//             <RoleUsers roleId={params.id} />
//           </div>

//           {/* العمود الأيمن - النشاط والمعلومات */}
//           <div className="space-y-6">
//             <RoleActivity roleId={params.id} />

//             {/* معلومات إضافية */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <h4 className="font-semibold text-blue-900 mb-2">Role Tips</h4>
//               <ul className="text-sm text-blue-700 space-y-1">
//                 <li>• Regularly review role permissions</li>
//                 <li>• Monitor user assignments</li>
//                 <li>• Update role descriptions when needed</li>
//                 <li>• Consider creating role templates</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ProtectedComponent>
//   );
// }
