"use client";

import { Activity, Clock, Settings, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoleActivity } from "@/lib/hooks/use-role-profile";

// تحديث الـ interface
interface RoleActivityProps {
  roleId: string;
  initialActivity?: Array<{
    // جعلها اختيارية
    id: number;
    action: string;
    description: string;
    timestamp: Date;
    type: "user" | "permission" | "system" | "view";
  }>;
}

export function RoleActivity({ roleId, initialActivity }: RoleActivityProps) {
  const { data: activities, isLoading } = useRoleActivity(roleId);
  const [displayActivities, setDisplayActivities] = useState(
    initialActivity || [],
  );

  useEffect(() => {
    if (activities && activities.length > 0) {
      setDisplayActivities(activities);
    }
  }, [activities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "permission":
        return <Shield className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      case "view":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user":
        return "text-green-600 bg-green-50";
      case "permission":
        return "text-blue-600 bg-blue-50";
      case "system":
        return "text-purple-600 bg-purple-50";
      case "view":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  if (isLoading && !initialActivity) {
    return <RoleActivitySkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Recent actions and changes related to this role
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayActivities.length > 0 ? (
          <div className="space-y-4">
            {displayActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div
                  className={`p-2 rounded-full ${getActivityColor(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {activity.action}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No recent activity
            </h3>
            <p className="text-gray-500">
              Activity will appear here when changes are made to this role.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoleActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// "use client";

// import { Activity, Clock, Settings, Shield, User } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useRoleActivity } from "@/lib/hooks/use-role-profile";

// interface RoleActivityProps {
//   roleId: string;
// }

// export function RoleActivity({ roleId }: RoleActivityProps) {
//   const { data: activities, isLoading } = useRoleActivity(roleId);

//   const getActivityIcon = (type: string) => {
//     switch (type) {
//       case "user":
//         return <User className="h-4 w-4" />;
//       case "permission":
//         return <Shield className="h-4 w-4" />;
//       case "system":
//         return <Settings className="h-4 w-4" />;
//       default:
//         return <Activity className="h-4 w-4" />;
//     }
//   };

//   const getActivityColor = (type: string) => {
//     switch (type) {
//       case "user":
//         return "text-green-600 bg-green-50";
//       case "permission":
//         return "text-blue-600 bg-blue-50";
//       case "system":
//         return "text-purple-600 bg-purple-50";
//       default:
//         return "text-gray-600 bg-gray-50";
//     }
//   };

//   const formatTimeAgo = (date: Date) => {
//     const now = new Date();
//     const diffInHours = Math.floor(
//       (now.getTime() - date.getTime()) / (1000 * 60 * 60),
//     );

//     if (diffInHours < 1) return "Just now";
//     if (diffInHours < 24) return `${diffInHours}h ago`;
//     if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
//     return `${Math.floor(diffInHours / 168)}w ago`;
//   };

//   if (isLoading) {
//     return <RoleActivitySkeleton />;
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Activity className="h-5 w-5" />
//           Recent Activity
//         </CardTitle>
//         <CardDescription>
//           Recent actions and changes related to this role
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {activities && activities.length > 0 ? (
//           <div className="space-y-4">
//             {activities.map((activity) => (
//               <div
//                 key={activity.id}
//                 className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
//               >
//                 <div
//                   className={`p-2 rounded-full ${getActivityColor(activity.type)}`}
//                 >
//                   {getActivityIcon(activity.type)}
//                 </div>
//                 <div className="flex-1 space-y-1">
//                   <div className="flex items-center gap-2">
//                     <span className="font-medium text-sm">
//                       {activity.action}
//                     </span>
//                     <Badge variant="outline" className="text-xs">
//                       {activity.type}
//                     </Badge>
//                   </div>
//                   <p className="text-sm text-gray-600">
//                     {activity.description}
//                   </p>
//                   <div className="flex items-center gap-1 text-xs text-gray-500">
//                     <Clock className="h-3 w-3" />
//                     {formatTimeAgo(activity.timestamp)}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               No recent activity
//             </h3>
//             <p className="text-gray-500">
//               Activity will appear here when changes are made to this role.
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// function RoleActivitySkeleton() {
//   return (
//     <Card>
//       <CardHeader>
//         <Skeleton className="h-6 w-40 mb-2" />
//         <Skeleton className="h-4 w-64" />
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {[...Array(3)].map((_, i) => (
//             // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
//             <div key={i} className="flex items-start gap-4">
//               <Skeleton className="h-8 w-8 rounded-full" />
//               <div className="space-y-2 flex-1">
//                 <Skeleton className="h-4 w-32" />
//                 <Skeleton className="h-3 w-48" />
//                 <Skeleton className="h-3 w-24" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
