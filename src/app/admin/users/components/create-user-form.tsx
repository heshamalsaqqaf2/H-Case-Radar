// components/admin/users/create-user-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Loader2, Lock, Mail, Shield, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRolesList } from "@/lib/authorization/hooks/admin/use-roles";
import { useCreateUser } from "@/lib/authorization/hooks/admin/use-users";
import type { Role } from "@/lib/authorization/types/roles";
import { generateSystemEmail } from "@/lib/utils/email-generator";
import { generateStrongPassword } from "@/lib/utils/password-generator";

const createUserSchema = z
  .object({
    name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
    email: z.string().email("بريد إلكتروني غير صحيح"),
    personalEmail: z.string().email("البريد الشخصي غير صحيح"),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    accountStatus: z.string(),
    roleIds: z.array(z.string()).min(1, "يجب اختيار دور واحد على الأقل"),
    sendCredentialsEmail: z.boolean(),
  })
  .refine((data) => data.email !== data.personalEmail, {
    message: "البريد الإلكتروني النظامي والشخصي يجب أن يكونا مختلفين",
    path: ["personalEmail"],
  });

type FormValues = {
  name: string;
  email: string;
  personalEmail: string;
  password: string;
  accountStatus: string;
  roleIds: string[];
  sendCredentialsEmail: boolean;
};

export function CreateUserForm() {
  const [open, setOpen] = useState(false);
  const createUserMutation = useCreateUser();
  const { data: rolesResult, isLoading: isLoadingRoles } = useRolesList();

  const form = useForm<FormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      personalEmail: "",
      password: "",
      accountStatus: "",
      roleIds: [],
      sendCredentialsEmail: true,
    },
    mode: "onChange",
  });

  const roles = rolesResult?.success ? rolesResult.data : [];

  const generatePassword = () => {
    const strongPassword = generateStrongPassword();
    form.setValue("password", strongPassword, { shouldValidate: true });
  };

  const generateSystemEmailFromName = () => {
    const name = form.getValues("name");
    if (name && name.length >= 2) {
      const systemEmail = generateSystemEmail(name);
      form.setValue("email", systemEmail, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await createUserMutation.mutateAsync(data);
      form.reset();
      setOpen(false);
    } catch (error) {
      // الخطأ معالج تلقائياً في الـ hook
    }
  };

  const removeRole = (roleId: string) => {
    const currentRoles = form.getValues("roleIds");
    form.setValue(
      "roleIds",
      currentRoles.filter((id) => id !== roleId),
      { shouldValidate: true },
    );
  };

  const addRole = (roleId: string) => {
    const currentRoles = form.getValues("roleIds");
    if (!currentRoles.includes(roleId)) {
      form.setValue("roleIds", [...currentRoles, roleId], { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          إنشاء مستخدم جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            إنشاء مستخدم جديد
          </DialogTitle>
          <DialogDescription>أضف مستخدم جديد إلى النظام وعين له الأدوار المناسبة</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* الاسم الكامل */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="أدخل الاسم الكامل"
                      disabled={createUserMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* البريد النظامي */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني النظامي *</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <AtSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="البريد النظامي للتسجيل"
                          className="pr-10"
                          disabled={createUserMutation.isPending}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateSystemEmailFromName}
                        disabled={createUserMutation.isPending}
                      >
                        توليد
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>بريد إلكتروني خاص بالنظام للتسجيل والدخول</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* البريد الشخصي */}
            <FormField
              control={form.control}
              name="personalEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني الشخصي *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="example@personal.com"
                        className="pr-10"
                        disabled={createUserMutation.isPending}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>سيتم إرسال بيانات الحساب ومعلومات التسجيل إلى هذا البريد</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* كلمة المرور */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور *</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="كلمة المرور"
                          className="pr-10"
                          disabled={createUserMutation.isPending}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                        disabled={createUserMutation.isPending}
                      >
                        توليد
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    استخدم كلمة مرور قوية أو اضغط على توليد لإنشاء واحدة تلقائياً
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الأدوار */}
            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    الأدوار *
                  </FormLabel>
                  <Select
                    onValueChange={addRole}
                    value=""
                    disabled={createUserMutation.isPending || isLoadingRoles}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={isLoadingRoles ? "جاري تحميل الأدوار..." : "اختر أدوار للمستخدم"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role: Role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span>{role.name}</span>
                            {role.description && (
                              <span className="text-xs text-muted-foreground">{role.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* عرض الأدوار المختارة */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((roleId: string) => {
                      const role = roles.find((r: Role) => r.id === roleId);
                      return role ? (
                        <Badge key={roleId} variant="secondary" className="flex items-center gap-1">
                          {role.name}
                          <button
                            type="button"
                            onClick={() => removeRole(roleId)}
                            className="hover:text-destructive text-xs"
                            disabled={createUserMutation.isPending}
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* حالة الحساب */}
            <FormField
              control={form.control}
              name="accountStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الحساب</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="حالة الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد التحقق</SelectItem>
                      <SelectItem value="active">مقبول</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* إرسال بريد الترحيب */}
            <FormField
              control={form.control}
              name="sendCredentialsEmail"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={createUserMutation.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>إرسال بريد ترحيب</FormLabel>
                    <FormDescription>
                      إرسال كلمة المرور ومعلومات الحساب عبر البريد الإلكتروني الشخصي للمستخدم الجديد
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* أزرار الإجراء */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createUserMutation.isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending || !form.formState.isValid}
                className="flex items-center gap-2"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    إنشاء المستخدم
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
