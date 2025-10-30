/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

"use client";
import {
  AlertTriangle,
  Database,
  Play,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  clearDatabase,
  reseedDatabase,
  seedDatabase,
} from "@/lib/authorization/actions/seed-actions";
export function SeedPanel() {
  const [loading, setLoading] = useState<"seed" | "clear" | "reseed" | null>(
    null,
  );
  const handleAction = async (action: "seed" | "clear" | "reseed") => {
    setLoading(action);

    try {
      let result = { success: false, message: "" };

      switch (action) {
        case "seed":
          result = await seedDatabase();
          break;
        case "clear":
          result = await clearDatabase();
          break;
        case "reseed":
          result = await reseedDatabase();
          break;
      }

      if (result.success) {
        toast.success("Success", {
          description: result.message,
        });
      } else {
        toast.error("Error", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(null);
    }
  };
  const actions = [
    {
      id: "seed" as const,
      label: "إنشاء قاعدة البيانات",
      loadingLabel: "ارســــــال...",
      description: "إضافة أدوار وصلاحيات أولية",
      icon: Database,
      variant: "default" as const,
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    {
      id: "reseed" as const,
      label: "إعادة إنشاء قاعدة البيانات",
      loadingLabel: "إعـــادة...",
      description: "امسح وأعد ارسال الصلاحيات والادوار الأولية",
      icon: RefreshCw,
      variant: "outline" as const,
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      id: "clear" as const,
      label: "مسح البيانات",
      loadingLabel: "مســـح...",
      description: "إزالة جميع الأدوار والصلاحيات من قاعدة البيانات",
      icon: Trash2,
      variant: "destructive" as const,
      className: "bg-red-600 hover:bg-red-700 text-white",
    },
  ];
  const roles = [
    {
      name: "مالك النظام",
      description: "وصول كامل إلى النظام",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      name: "الأدمن",
      description: "وصول إداري واسع النطاق",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      name: "مسؤول البلاغات",
      description: "وصول كامل إلى إدارة البلاغات",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      name: "ضابط الإتصال",
      description: "وصول إلى البلاغات والتواصل مع المستفيدين",
      color: "bg-teal-100 text-teal-800 border-teal-200",
    },
    {
      name: "مستخدم عادي",
      description: "وصول محدود الى مواد النظام",
      color: "bg-pink-100 text-pink-800 border-pink-200",
    },
    {
      name: "ضيف",
      description: "وصول للقراءة فقط",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
  ];

  return (
    <div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">تهيئة قاعدة البيانات</CardTitle>
              <CardDescription>
                تهيئة وإدارة أدوار وصلاحيات وأذونات قاعدة البيانات
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="space-y-3 p-4 rounded-lg border">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {loading === "seed" &&
                    "Seeding database with default data..."}
                  {loading === "clear" &&
                    "Clearing all roles and permissions..."}
                  {loading === "reseed" && "Reseeding database..."}
                </span>
                <span className="">Please wait...</span>
              </div>
              <Progress value={100} className="h-1 bg-blue-600" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action) => {
              const Icon = action.icon;
              const isLoading = loading === action.id;

              return (
                <Button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  disabled={!!loading}
                  variant={action.variant}
                  className={`h-20 flex flex-col items-center justify-center gap-2 p-4 transition-all ${
                    isLoading ? "opacity-70" : "hover:shadow-md"
                  } ${action.className}`}
                >
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-sm">
                      {isLoading ? action.loadingLabel : action.label}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 text-center">
                    {action.description}
                  </p>
                </Button>
              );
            })}
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Actions */}
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Play className="h-4 w-4 text-blue-600" />
                  الإجراءات المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <action.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm ">{action.label}</p>
                      <p className="text-xs mt-1">{action.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Default Roles */}
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  الأدوار الافتراضية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {roles.map((role) => (
                  <div
                    key={role.name}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`${role.color} font-mono text-xs border`}
                      >
                        {role.name}
                      </Badge>
                    </div>
                    <span className="text-xs text-right">
                      {role.description}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Warning Alert */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>هـــــــــام:</strong> ستؤدي هذه الإجراءات إلى تعديل بنية
              قاعدة البيانات الخاصة بك. يوصى بإنشاء نسخة احتياطية قبل الشروع في
              إجراء أي تغييرات.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

// "use client";
// import { useState } from "react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   clearDatabase,
//   reseedDatabase,
//   seedDatabase,
// } from "@/lib/authorization/actions/seed-actions";

// export function SeedPanel() {
//   const [loading, setLoading] = useState<"seed" | "clear" | "reseed" | null>(
//     null,
//   );

//   const handleAction = async (action: "seed" | "clear" | "reseed") => {
//     setLoading(action);

//     try {
//       let result = { success: false, message: "" };

//       switch (action) {
//         case "seed":
//           result = await seedDatabase();
//           break;
//         case "clear":
//           result = await clearDatabase();
//           break;
//         case "reseed":
//           result = await reseedDatabase();
//           break;
//       }

//       if (result.success) {
//         toast.success("Success", {
//           description: result.message,
//         });
//       } else {
//         toast.error("Error", {
//           description: result.message,
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error", {
//         description: "An unexpected error occurred",
//       });
//     } finally {
//       setLoading(null);
//     }
//   };

//   return (
//     <Card className="w-full max-w-2xl mx-auto">
//       <CardHeader>
//         <CardTitle>Database Initialization</CardTitle>
//         <CardDescription>
//           Initialize the database with default roles and permissions
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Button
//             onClick={() => handleAction("seed")}
//             disabled={!!loading}
//             variant="default"
//             className="w-full"
//           >
//             {loading === "seed" ? "Seeding..." : "Seed Database"}
//           </Button>

//           <Button
//             onClick={() => handleAction("clear")}
//             disabled={!!loading}
//             variant="outline"
//             className="w-full"
//           >
//             {loading === "clear" ? "Clearing..." : "Clear Data"}
//           </Button>

//           <Button
//             onClick={() => handleAction("reseed")}
//             disabled={!!loading}
//             variant="destructive"
//             className="w-full"
//           >
//             {loading === "reseed" ? "Reseeding..." : "Reseed Database"}
//           </Button>
//         </div>

//         <div className="text-sm text-muted-foreground space-y-2">
//           <div className="p-3 bg-muted rounded-lg">
//             <h4 className="font-semibold mb-2">Available Actions:</h4>
//             <ul className="space-y-1 list-disc list-inside">
//               <li>
//                 <strong>Seed Database:</strong> Add default roles and
//                 permissions
//               </li>
//               <li>
//                 <strong>Clear Data:</strong> Remove all roles and permissions
//               </li>
//               <li>
//                 <strong>Reseed Database:</strong> Clear and seed again
//               </li>
//             </ul>
//           </div>

//           <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//             <h4 className="font-semibold mb-2 text-blue-800">Default Roles:</h4>
//             <ul className="space-y-1">
//               <li>
//                 • <strong>super_admin:</strong> Full system access
//               </li>
//               <li>
//                 • <strong>admin:</strong> Extensive administrative access
//               </li>
//               <li>
//                 • <strong>moderator:</strong> Content management
//               </li>
//               <li>
//                 • <strong>user:</strong> Regular user permissions
//               </li>
//               <li>
//                 • <strong>viewer:</strong> Read-only access
//               </li>
//             </ul>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
//               <li>
//                 <strong>Reseed Database:</strong> Clear and seed again
//               </li>
//             </ul>
//           </div>

//           <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//             <h4 className="font-semibold mb-2 text-blue-800">Default Roles:</h4>
//             <ul className="space-y-1">
//               <li>
//                 • <strong>super_admin:</strong> Full system access
//               </li>
//               <li>
//                 • <strong>admin:</strong> Extensive administrative access
//               </li>
//               <li>
//                 • <strong>moderator:</strong> Content management
//               </li>
//               <li>
//                 • <strong>user:</strong> Regular user permissions
//               </li>
//               <li>
//                 • <strong>viewer:</strong> Read-only access
//               </li>
//             </ul>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
