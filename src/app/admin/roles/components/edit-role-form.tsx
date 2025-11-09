// src/components/admin/roles/edit-role-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateRole } from "@/lib/authorization/hooks/admin/use-roles";
import type { Permission } from "@/lib/authorization/types/roles";
import { RolePermissionsManager } from "./role-permissions-manager";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "يجب أن يكون  2 أحرف")
    .max(50, "يجب أن يكون الاسم أقل من 50 حرف")
    .regex(/^[a-zA-Z0-9_]+$/, "يمكن أن يحتوي الاسم على أحرف وأرقام وشرطات سفلية فقط"),
  description: z
    .string()
    .min(5, "يجب أن يكون  5 أحرف")
    .max(200, "يجب أن يكون الوصف أقل من 200 حرف"),
  isDefault: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditRoleFormProps {
  role: {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
  permissions: Permission[];
}

export function EditRoleForm({ role, permissions }: EditRoleFormProps) {
  const updateRoleMutation = useUpdateRole();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role.name,
      description: role.description || "",
      isDefault: role.isDefault || false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    // استخدام البيانات المهيكلة بدلاً من FormData
    await updateRoleMutation.mutateAsync({
      id: role.id,
      name: data.name,
      description: data.description,
      isDefault: data.isDefault,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/roles">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl uppercase font-bold flex items-center gap-2">
            {/* <Shield className="h-8 w-8 text-blue-500" /> */}
            تعديل الدور: {role.name}
          </h1>
          <p className="text-gray-600 mt-1">
            تعديل تفاصيل بيانات الأدوار و إعطائها صلاحيات مناسبة لطبيعة عملها
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Details Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>تفاصيل الدور</CardTitle>
            <CardDescription>تحديث المعلومات الأساسية لهذا الدور</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الدور</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: content_manager" {...field} dir="ltr" />
                      </FormControl>
                      <FormDescription className="text-red-400 flex items-center gap-2 rtl:flex-row-reverse">
                        <Info className="h-4 w-4 text-red-600" />
                        ملاحظة: يجب أن يكون اسم هذا الدور فريداً في النظام
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Textarea placeholder="صف ما يمكن أن يفعله هذا الدور..." {...field} />
                      </FormControl>
                      <FormDescription>وصف موجز لغرض الدور</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:flex-row-reverse rtl:space-x-reverse">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>دور افتراضي</FormLabel>
                        <FormDescription>تعيين هذا الدور للمستخدمين الجدد تلقائياً</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={updateRoleMutation.isPending} className="gap-2">
                  {updateRoleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  تحديث الدور
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Permissions Manager */}
        <div className="lg:col-span-1 space-y-6">
          <RolePermissionsManager
            role={{ id: role.id, name: role.name }}
            initialPermissions={permissions}
          />

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">معلومات الدور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 grid grid-cols-2 gap-x-2 text-sm">
              <div>
                <span className="font-medium">معرف الدور:</span>
                <p className="text-gray-600 font-mono text-xs">{role.id.split("-")[0]}</p>
              </div>
              <div>
                <span className="font-medium">الاسم:</span>
                <p className="text-gray-600 font-mono text-xs">{role.name}</p>
              </div>
              <div>
                <span className="font-medium">تاريخ الإنشاء:</span>
                <p className="text-gray-600">
                  {new Date(role.createdAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
              <div>
                <span className="font-medium">آخر تحديث:</span>
                <p className="text-gray-600">
                  {new Date(role.updatedAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
