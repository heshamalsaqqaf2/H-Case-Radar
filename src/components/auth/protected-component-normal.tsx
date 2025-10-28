/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { useEffect, useState } from "react";
import {
  useCurrentUser,
  useUserPermissions,
} from "@/lib/authorization/hooks/use-auth";
import { Button } from "../ui/button";

interface ProtectedComponentProps {
  children: React.ReactNode;
  permission?: string;
  fallback?: React.ReactNode;
}

export function ProtectedComponent({
  children,
  permission,
  fallback,
}: ProtectedComponentProps) {
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    status: userStatus,
  } = useCurrentUser();

  const {
    data: userPermissions,
    isLoading: permissionsLoading,
    status: permissionsStatus,
  } = useUserPermissions(user?.id);

  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log("🔍 ProtectedComponent state:", {
    userStatus,
    userLoading,
    user: user ? { id: user.id, email: user.email } : null,
    permissionsStatus,
    permissionsLoading,
    userPermissionsCount: userPermissions?.length || 0,
    permissionRequired: permission,
  });

  useEffect(() => {
    const checkAccess = async () => {
      console.log("🔄 ProtectedComponent checkAccess started");

      if (!user) {
        console.log("❌ ProtectedComponent - No user found");
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        let access = false;

        if (permission) {
          // البحث عن الصلاحية المطلوبة
          access =
            userPermissions?.some((perm) => perm.name === permission) || false;
          console.log(`🔐 Checking permission '${permission}':`, access);
        } else {
          // إذا لم يتم تحديد صلاحية معينة، افترض أن الوصول مسموح للمستخدمين المسجلين
          access = false;
          console.log("✅ No specific permission required, access granted");
        }

        setHasAccess(access);
      } catch (error) {
        console.error("❌ ProtectedComponent - Error checking access:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
        console.log("🏁 ProtectedComponent checkAccess completed");
      }
    };

    // تأخير الفحص قليلاً للسماح للبيانات بالتحميل
    const timer = setTimeout(checkAccess, 100);
    return () => clearTimeout(timer);
  }, [user, userPermissions, permission]);

  const isLoading = userLoading || permissionsLoading || loading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Checking permissions...</p>
          <p className="text-xs text-gray-500 mt-1">
            User: {userStatus} | Permissions: {permissionsStatus}
          </p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600">
            Authentication Error
          </h3>
          <p className="text-muted-foreground">{userError.message}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium">Authentication Required</h3>
          <p className="text-muted-foreground">
            Please log in to access this page.
          </p>
          <div className="mt-4 space-y-2 text-xs text-gray-500">
            <p>User object is null - Possible issues:</p>
            <ul className="list-disc list-inside text-left">
              <li>Better Auth session not working</li>
              <li>Cookies not being sent properly</li>
              <li>API route configuration issue</li>
            </ul>
          </div>
          <div className="mt-4">
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">
              Go to Home Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-muted-foreground">
              {permission
                ? `You don't have permission: ${permission}`
                : "You don't have permission to access this resource."}
            </p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Logged in as: {user.email}</p>
              <p>Available permissions: {userPermissions?.length || 0}</p>
              {userPermissions && userPermissions.length > 0 && (
                <div className="mt-2">
                  <p>Your permissions:</p>
                  <ul className="max-h-20 overflow-y-auto">
                    {userPermissions.map((perm, idx) => (
                      <li key={idx} className="text-left">
                        • {perm.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    );
  }

  console.log("🎉 ProtectedComponent - Access granted!");
  return <>{children}</>;
}
