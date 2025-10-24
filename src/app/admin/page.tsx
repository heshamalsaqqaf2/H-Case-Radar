import { DashboardStats } from "@/components/admin/dashboard-stats";
import { QuickActions } from "@/components/admin/quick-actions";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function AdminDashboard() {
  return (
    <ProtectedComponent permission="admin.dashboard.view">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2">Welcome to your admin dashboard</p>
        </div>

        <DashboardStats />
        <QuickActions />

        {/* قسم المعلومات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-blue-200 rounded-lg p-4">
            <h3 className="font-semiboldmb-2">System Status</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Authentication: Working</li>
              <li>✅ Permissions: Loaded</li>
              <li>✅ Database: Connected</li>
              <li>✅ Admin Access: Granted</li>
            </ul>
          </div>

          <div className="border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Quick Links</h3>
            <ul className="text-sm space-y-1">
              <li>
                •{" "}
                <a
                  href="/admin/users"
                  className="text-green-700 hover:underline"
                >
                  Manage Users
                </a>
              </li>
              <li>
                •{" "}
                <a
                  href="/admin/roles"
                  className="text-green-700 hover:underline"
                >
                  Manage Roles
                </a>
              </li>
              <li>
                •{" "}
                <a
                  href="/admin/permissions"
                  className="text-green-700 hover:underline"
                >
                  View Permissions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedComponent>
  );
}

// import { DashboardStats } from "@/components/admin/dashboard-stats";
// import { QuickActions } from "@/components/admin/quick-actions";
// import { ProtectedComponent } from "@/components/auth/protected-component";

// export default function AdminDashboard() {
//   return (
//     <ProtectedComponent permission="admin.dashboard.view">
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//           <p className="text-gray-600">Welcome to your admin dashboard</p>
//         </div>

//         <DashboardStats />
//         <QuickActions />

//         {/* قسم للتحقق من الصلاحيات */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <h3 className="font-semibold text-blue-800 mb-2">
//               Your Permissions
//             </h3>
//             <ProtectedComponent permission="user.view">
//               <div className="text-green-600 text-sm">✅ Can view users</div>
//             </ProtectedComponent>
//             <ProtectedComponent permission="user.create">
//               <div className="text-green-600 text-sm">✅ Can create users</div>
//             </ProtectedComponent>
//             <ProtectedComponent permission="role.view">
//               <div className="text-green-600 text-sm">✅ Can view roles</div>
//             </ProtectedComponent>
//           </div>

//           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//             <h3 className="font-semibold text-green-800 mb-2">Quick Start</h3>
//             <ul className="text-sm space-y-1">
//               <li>• Check your permissions above</li>
//               <li>• Visit different admin sections</li>
//               <li>• Manage users and roles</li>
//               <li>• Configure system settings</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </ProtectedComponent>
//   );
// }
