// components/admin/users/user-roles-dialog.tsx
"use client";

import { IconTimeDuration60 } from "@tabler/icons-react";
import {
  BadgeX,
  BadgeXIcon,
  CalendarRangeIcon,
  MailCheckIcon,
  MailXIcon,
  Plus,
  Shield,
  ShieldCloseIcon,
  User,
  VerifiedIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useRolesList } from "@/lib/authorization/hooks/admin/use-roles";
import { useUserManagement } from "@/lib/authorization/hooks/admin/use-users";
import type { UserRole, UserWithRoles } from "@/lib/authorization/types/user";

interface UserRolesDialogProps {
  user: UserWithRoles;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserRolesDialog({ user, open, onOpenChange }: UserRolesDialogProps) {
  const { assignRole, removeRole, isAssigningRole, isRemovingRole } = useUserManagement(user.id);
  const { data: rolesResult, isLoading: rolesLoading } = useRolesList();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const userRoles = user.roles;

  const availableRoles = rolesResult?.success ? rolesResult.data : [];
  const assignableRoles = availableRoles.filter(
    (role: UserRole) => !userRoles.some((userRole) => userRole.id === role.id),
  );

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    try {
      await assignRole(selectedRoleId);
      setSelectedRoleId("");
    } catch (error) {
      // الخطأ معالج تلقائياً
      console.error(error);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await removeRole(roleId);
    } catch (error) {
      // الخطأ معالج تلقائياً
      console.error(error);
    }
  };

  if (rolesLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>إدارة أدوار المستخدم</DialogTitle>
            <DialogDescription>جاري تحميل البيانات...</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            إدارة أدوار المستخدم
          </DialogTitle>
          <DialogDescription>
            إدارة الأدوار الممنوحة لـ <strong className="text-primary">{user.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {/* معلومات المستخدم */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                معلومات المستخدم
                {user.banned ? (
                  <Badge className="bg-red-50 text-red-600">
                    محظور
                    <ShieldCloseIcon className="animate-caret-blink text-red-500" />
                  </Badge>
                ) : (
                  <Badge className="bg-green-50 text-green-600">
                    نشط
                    <VerifiedIcon className="animate-bounce text-green-600" />
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 font-bold items-center justify-center rounded-full bg-muted">
                      {user.name.charAt(0) + user.name.charAt(1)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <MailCheckIcon className="size-3.5 text-primary" />
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarRangeIcon className="size-3.5 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleTimeString("en-US") +
                          " - " +
                          new Date(user.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {user.emailVerified ? (
                      <Badge className="text-xs text-green-600 bg-green-100">
                        بريد متحقق <MailCheckIcon />
                      </Badge>
                    ) : (
                      <Badge className="text-xs text-red-600 bg-red-100">
                        بريد غير متحقق <MailXIcon />
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase truncate mt-1">
                    {user.roles && user.roles.length > 0 ? (
                      <Badge className="py-1 px-2 bg-gradient-to-l rounded-sm border-none outline-none text-gray-50 text-xs from-emerald-500 to-lime-500">
                        {user.roles[0].name}
                      </Badge>
                    ) : (
                      <Badge className="mt-1 py-1 px-2 bg-gradient-to-l rounded-sm border-none outline-none text-gray-50 text-xs from-orange-500 to-amber-500">
                        لا يوجد دور ممنوح{" "}
                        <BadgeXIcon className="animate-spin mt-1 text-orange-700" />
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الأدوار الحالية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>الأدوار الممنوحة</span>
                <Badge className="text-md bg-gradient-to-tr rounded-xs border-none outline-none text-gray-50 from-green-500 to-teal-500">
                  {userRoles.length}
                </Badge>
              </CardTitle>
              <CardDescription>الأدوار الممنوحة حاليًا لهذا المستخدم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userRoles.length === 0 ? (
                  <Badge className="bg-gradient-to-l from-teal-500 to-green-500 px-10 py-3 text-sm border-none outline-none m-auto">
                    لا توجد أدوار ممنوحة
                  </Badge>
                ) : (
                  userRoles.map((role) => (
                    <Badge
                      key={role.id}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-1"
                    >
                      <Shield className="h-4 w-4" />
                      <span>{role.name}</span>
                      <Button
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 rounded-xs hover:text-red-500 hover:font-extrabold"
                        onClick={() => handleRemoveRole(role.id)}
                        disabled={isRemovingRole}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* منح دور جديد */}
          {assignableRoles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span>منح دور جديد</span>
                </CardTitle>
                <CardDescription>اختر دورًا جديدًا لمنحه للمستخدم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId} dir="rtl">
                    <SelectTrigger className="flex-1 w-4/5">
                      <SelectValue placeholder="اختر دورا جديدا لمنحه للمستخدم" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {assignableRoles.map((role: UserRole) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span className="font-medium capitalize">{role.name}</span>
                            {role.description && (
                              <span className="text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAssignRole} disabled={!selectedRoleId || isAssigningRole}>
                    {isAssigningRole ? (
                      <Spinner style={{ width: "20px", height: "20px" }} />
                    ) : (
                      "إضافة دور"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {assignableRoles.length === 0 && availableRoles.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2" />
                  <p>المستخدم لديه جميع الأدوار المتاحة</p>
                </div>
              </CardContent>
            </Card>
          )}

          {availableRoles.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2" />
                  <p>لا توجد أدوار متاحة في النظام</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
