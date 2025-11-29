// src/components/admin/roles/role-users.tsx
"use client";

import { Mail, Plus, Trash2Icon, User, Users, Zap } from "lucide-react";
import Link from "next/link";
import { TableRowLoading } from "@/components/shared/quick-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRoleProfile } from "@/lib/authorization/hooks/admin/use-roles";
import type { UserRoleAssignment } from "@/lib/authorization/types/roles";

interface RoleUsersProps {
  roleId: string;
  initialUsers: UserRoleAssignment[] | undefined;
}

export function RoleUsers({ roleId, initialUsers }: RoleUsersProps) {
  const { data: profileResult, isLoading, isFetching } = useRoleProfile(roleId);
  const users = initialUsers || (profileResult?.success ? profileResult.data?.users || [] : []);

  return (
    <Card className="relative">
      {/* مؤشر تحديث خفي */}
      {isFetching && (
        <div className="absolute top-3 left-3">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              المستخدمون المعينون
              <Badge className="mr-1 border-none bg-linear-to-r from-emerald-500 to-emerald-600">
                {users.length}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              المستخدمون الذين لديهم هذا الدور
              {isFetching && (
                <Badge className="text-xs text-white bg-blue-500">
                  <Spinner className="mr-2" />
                  جاري مزامنة البيانات
                </Badge>
              )}
            </CardDescription>
          </div>

          <Button size="sm" className="gap-2" asChild>
            <Link href={`/admin/roles/${roleId}/assign-users`}>
              <Plus className="h-4 w-4" />
              تعيين مستخدمين لهذا الدور
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead className="w-[120px]">تاريخ التعيين</TableHead>
                <TableHead className="w-[100px] text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !profileResult ? (
                <TableRowLoading rows={3} />
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <TableRow key={index.toString()} className="">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-full transition-colors">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-xs text-foreground">
                            انضم في {new Date(user.userCreatedAt).toLocaleDateString("en-US")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-blue-500">
                        <Mail className="h-4 w-4" />
                        {user.userEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-blue-500">
                        {new Date(user.assignedAt).toLocaleDateString("en-US")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          إزالة
                          <Trash2Icon className="h-4 w-4 animate-bounce" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا يوجد مستخدمون معينون</h3>
                    <p className="mb-4">ابدأ بتعيين مستخدمين لهذا الدور</p>
                    <Button asChild>
                      <Link href={`/admin/roles/${roleId}/assign-users`}>
                        <Plus className="h-4 w-4 ml-2" />
                        تعيين أول مستخدم
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
