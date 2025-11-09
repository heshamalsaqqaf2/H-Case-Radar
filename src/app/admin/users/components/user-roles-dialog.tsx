// components/admin/users/user-roles-dialog.tsx
"use client";

import { Plus, Shield, User, X } from "lucide-react";
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            إدارة أدوار المستخدم
          </DialogTitle>
          <DialogDescription>
            إدارة الأدوار الممنوحة لـ <strong>{user.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات المستخدم */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                معلومات المستخدم
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الأدوار الحالية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>الأدوار الممنوحة</span>
                <Badge variant="secondary" className="text-xs">
                  {userRoles.length}
                </Badge>
              </CardTitle>
              <CardDescription>الأدوار الممنوحة حاليًا لهذا المستخدم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userRoles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">لا توجد أدوار ممنوحة</p>
                ) : (
                  userRoles.map((role) => (
                    <Badge
                      key={role.id}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      <span>{role.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
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
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر دورًا..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role: UserRole) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span>{role.name}</span>
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
                    {isAssigningRole ? "جاري الإضافة..." : "إضافة"}
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
