// src/components/admin/roles/role-users.tsx
"use client";

import { Mail, Plus, User, Users, Zap } from "lucide-react";
import Link from "next/link";
import { TableRowLoading } from "@/components/shared/quick-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="absolute top-3 left-3 rtl:right-3 rtl:left-auto">
          <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between rtl:flex-row-reverse">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg rtl:flex-row-reverse">
              <Users className="h-5 w-5" />
              المستخدمون المعينون
              <Badge variant="secondary" className="mr-2 rtl:ml-2 rtl:mr-0">
                {users.length}
              </Badge>
            </CardTitle>
            <CardDescription>المستخدمون الذين لديهم هذا الدور</CardDescription>
          </div>

          <Button size="sm" className="gap-2" asChild>
            <Link href={`/admin/roles/${roleId}/assign-users`}>
              <Plus className="h-4 w-4" />
              تعيين مستخدمين
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
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
                  // biome-ignore lint/suspicious/noArrayIndexKey: <>
                  <TableRow key={index} className="group hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3 rtl:flex-row-reverse">
                        <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.userName}</div>
                          <div className="text-xs text-gray-500">
                            انضم في {new Date(user.userCreatedAt).toLocaleDateString("en-US")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600 rtl:flex-row-reverse">
                        <Mail className="h-4 w-4" />
                        {user.userEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(user.assignedAt).toLocaleDateString("en-US")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          إزالة
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      لا يوجد مستخدمون معينون
                    </h3>
                    <p className="text-gray-500 mb-4">ابدأ بتعيين مستخدمين لهذا الدور</p>
                    <Button asChild>
                      <Link href={`/admin/roles/${roleId}/assign-users`}>
                        <Plus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
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
