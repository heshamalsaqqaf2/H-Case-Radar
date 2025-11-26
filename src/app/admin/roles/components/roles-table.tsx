// src/components/admin/roles/roles-table.tsx
"use client";

import { Edit, Edit2Icon, MoreHorizontal, Shield, Trash2, Trash2Icon, User, Users } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  children?: ReactNode;
}

export function RolesTable({ initialRoles, children }: RolesTableProps) {
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#b4552d]" />
              بيانات الأدوار وتفاضيلها
            </CardTitle>
            {children}
          </div>
          <CardDescription className="text-muted-foreground">
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
                          <Shield className="h-4 w-4 text-[#00a63e]" />
                          <span className="font-mono text-sm">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {role.description || "لا يوجد وصف"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {role.isDefault ? (
                          // TODO: add tooltip
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="text-xs bg-[#b4552d]">افتراضي</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>هذا الدور افتراضي يتم التعامل معه بشكل افتراضي في جميع وحدات النظام</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="text-xs bg-[#9810fa]">مخصص</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>هذا الدور مخصص يتم إنشاؤه بشكل بحسب طبيعة الأدوار المطلوبة في وحدة النظام</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="text-xs bg-[#1a1915]">
                              <span>{role.userCount}</span>
                              <Users className="h-4 w-4 text-[#b4552d] dark:text-primary" />
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>عدد المستخدمين في هذا الدور</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/roles/${role.id}`}
                                className="flex items-center"
                              >
                                <Edit2Icon className="h-4 w-4" />
                                <span>تعديل الدور</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/roles/${role.id}/profile`}
                                className="flex items-center"
                              >
                                <User className="h-4 w-4" />
                                <span>عرض الملف</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="bg-destructive flex items-center"
                              onClick={() => setRoleToDelete(role.id)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                              <span>حذف الدور</span>
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
