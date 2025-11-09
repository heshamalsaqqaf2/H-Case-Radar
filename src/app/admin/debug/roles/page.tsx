// src/app/admin/debug/roles/page.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
import { getCurrentUserId } from "@/lib/authentication/session";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";

export default async function DebugRolesPage() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return <div>❌ لا يوجد مستخدم</div>;
    }

    const debugInfo = await authorizationService.debugUserRoles(userId);

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">تشخيص الأدوار والصلاحيات</h1>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-bold mb-2">أدوار المستخدم:</h2>
            {debugInfo.userRoles.map((role, index) => (
              <div key={index} className="mb-2">
                <strong>{role.name}</strong> (ID: {role.id})
              </div>
            ))}
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h2 className="font-bold mb-2">الصلاحيات لكل دور:</h2>
            {debugInfo.rolesWithPermissions.map((item, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-semibold">الدور: {item.role}</h3>
                <div className="ml-4">
                  {item.permissions.map(
                    (permission: string, pIndex: number) => (
                      <div key={pIndex} className="text-sm">
                        • {permission}
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in debug roles page:", error);
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>خطأ:</strong>{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }
}
