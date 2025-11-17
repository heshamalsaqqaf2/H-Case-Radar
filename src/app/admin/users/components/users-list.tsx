// components/admin/users/users-list.tsx
"use client";

import { Ban, Calendar, Edit, Mail, Shield, User, UserCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBanUser, useUnbanUser, useUsers } from "@/lib/authorization/hooks/admin/use-users";
import type { UserWithRoles } from "@/lib/authorization/types/user";
import { CreateUserForm } from "./create-user-form";
import { UserEditDialog } from "./user-edit-dialog";
import { UserRolesDialog } from "./user-roles-dialog";
import { UserStatisticsCard } from "./user-statistics-card";

interface UsersListProps {
  initialUsers?: UserWithRoles[];
}

export function UsersList({ initialUsers }: UsersListProps) {
  // const { data: usersResult, isLoading, error } = useUsers();
  const {
    data: usersResult,
    isLoading,
    error,
  } = useUsers({
    initialData: initialUsers ? { success: true, data: initialUsers } : undefined,
  });

  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  // const { data: permissionsResult } = usePermissions();

  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [managingRolesUser, setManagingRolesUser] = useState<UserWithRoles | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);

  if (isLoading) {
    return <UsersListSkeleton />;
  }
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p className="font-semibold">خطأ في تحميل المستخدمين</p>
            <p className="text-xl mt-1">{error.name}</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!usersResult?.success) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p className="font-semibold">حدث خطأ غير متوقع</p>
            <p className="text-sm mt-1">{usersResult?.error.message || "يرجى المحاولة مرة أخرى"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const users = usersResult.data;
  const handleToggleBan = async (user: UserWithRoles) => {
    // const selectRole = user.roles.find((role) => role.name !== "super_admin");
    // if (!selectRole) {
    //   return toast.warning("لا يمكن من حظر حساب لديه دور" + " 'SuperAdmin'");
    // }
    if (user.banned) {
      await unbanMutation.mutateAsync({ targetUserId: user.id });
    } else {
      await banMutation.mutateAsync({ targetUserId: user.id, reason: "إجراء إداري" });
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "لم يسجل دخول";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (user: UserWithRoles) => {
    if (user.banned) return "bg-red-100 text-red-500";
    if (user.emailVerified) return "bg-green-100 text-green-500";
    return "bg-orange-100 text-orange-500";
  };

  const getStatusText = (user: UserWithRoles) => {
    if (user.banned) return "محظور";
    if (user.emailVerified) return "نشط";
    return "غير متحقق";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">إدارة حسابات المستخدمين، الأدوار، والصلاحيات</p>
        </div>
        <Badge className="w-fit px-3 py-1 text-sm bg-linear-to-l from-teal-500 to-green-500">
          {users.length} - All USERS
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* الإحصائيات السريعة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {users.filter((u) => !u.banned && u.emailVerified).length} */}
              {users.filter((u) => !u.banned).length}
            </div>
            <p className="text-xs text-muted-foreground">من أصل {users.length} مستخدم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحظورون</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.banned).length}</div>
            <p className="text-xs text-muted-foreground">مستخدم محظور</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأدوار الممنوحة</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((acc, user) => acc + user.roles.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">دور ممنوح للمستخدمين</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>عرض وإدارة جميع مستخدمي النظام</CardDescription>
          {/* اضافة مستخدم */}
          <CreateUserForm />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">ID</TableHead>
                  <TableHead className="w-[110px]">المستخدم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأدوار</TableHead>
                  <TableHead>آخر دخول</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index = 1) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell>{++index}</TableCell>
                    <TableCell>
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
                          <div className="flex h-10 w-10 font-bold text-primary items-center justify-center rounded-full bg-muted">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {/* <div className="flex items-center gap-1 text-sm text-blue-800">
                            <Mailbox className="h-3 w-3" />
                            {user.personalEmail}
                          </div> */}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(user)}>{getStatusText(user)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((role) => (
                          <Badge
                            key={role.id}
                            variant="outline"
                            className="text-xs uppercase bg-blue-100 text-blue-500 border-none max-w-[100px] truncate"
                          >
                            {role.name}
                          </Badge>
                        ))}
                        {user.roles.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.roles.length - 2}
                          </Badge>
                        )}
                        {user.roles.length === 0 && (
                          <span className="text-sm text-muted-foreground">لا توجد أدوار</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.lastLoginAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingUser(user);
                          }}
                          title="تعديل المستخدم"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagingRolesUser(user);
                          }}
                          title="إدارة الأدوار"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.banned ? "default" : "destructive"}
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBan(user);
                          }}
                          disabled={banMutation.isPending || unbanMutation.isPending}
                          title={user.banned ? "فك الحظر" : "حظر المستخدم"}
                        >
                          {user.banned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-right py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد مستخدمين</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {editingUser && (
        <UserEditDialog user={editingUser} open={!!editingUser} onOpenChange={() => setEditingUser(null)} />
      )}

      {managingRolesUser && (
        <UserRolesDialog
          user={managingRolesUser}
          open={!!managingRolesUser}
          onOpenChange={() => setManagingRolesUser(null)}
        />
      )}

      {selectedUser && (
        <UserStatisticsCard
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

function UsersListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md bg-muted" />
          <Skeleton className="h-4 w-64 rounded-md bg-gray-400" />
        </div>
        <Skeleton className="h-6 w-16 rounded-md bg-gray-400" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <>
          <Skeleton key={index} className="h-24 w-full rounded-md bg-gray-400" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-md bg-gray-400" />
    </div>
  );
}
