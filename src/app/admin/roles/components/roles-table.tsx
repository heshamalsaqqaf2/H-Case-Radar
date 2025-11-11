// src/components/admin/roles/roles-table.tsx
"use client";

import { Edit, MoreHorizontal, Shield, Trash2, User, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteRole } from "@/lib/authorization/hooks/admin/use-roles";

interface Role {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean | null;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RolesTableProps {
  initialRoles: Role[];
}

export function RolesTable({ initialRoles }: RolesTableProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const deleteRoleMutation = useDeleteRole();

  const handleDelete = async () => {
    if (!roleToDelete) return;

    const previousRoles = roles;
    setRoles(roles.filter((role) => role.id !== roleToDelete));

    await deleteRoleMutation.mutateAsync(
      { id: roleToDelete },
      {
        onSuccess: (result) => {
          if (result.success) {
            setRoles(roles.filter((role) => role.id !== roleToDelete));
            setRoleToDelete(null);
          }
        },
        onError: () => {
          // ✅ استعادة الحالة في حالة خطأ
          setRoles(previousRoles);
        },
      },
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            أدوار النظام
          </CardTitle>
          <CardDescription>
            إدارة الأدوار والصلاحيات. تحدد الأدوار ما يمكن للمستخدمين فعله في النظام.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roles && roles.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الدور</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المستخدمين</TableHead>
                    <TableHead className="w-[100px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="font-mono text-sm">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {role.description || "لا يوجد وصف"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {role.isDefault ? (
                          <Badge variant="secondary" className="text-xs">
                            افتراضي
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            مخصص
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{role.userCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">فتح القائمة</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-right">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/roles/${role.id}`}
                                className="flex items-center justify-end gap-2 rtl:flex-row-reverse"
                              >
                                <Edit className="h-4 w-4" />
                                <span>تعديل الدور</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 flex items-center justify-end gap-2 rtl:flex-row-reverse"
                              onClick={() => setRoleToDelete(role.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>حذف الدور</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/roles/${role.id}/profile`}
                                className="flex items-center justify-end gap-2 rtl:flex-row-reverse"
                              >
                                <User className="h-4 w-4" />
                                <span>عرض الملف</span>
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لم يتم العثور على أدوار</h3>
              <p className="text-gray-500 mb-6">ابدأ بإنشاء أول دور في النظام.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الدور بشكل نهائي من النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rtl:flex-row-reverse">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2 rtl:flex-row-reverse"
              disabled={deleteRoleMutation.isPending}
            >
              {deleteRoleMutation.isPending ? (
                <>
                  <Spinner className="h-4 w-4" />
                  جاري الحذف
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
