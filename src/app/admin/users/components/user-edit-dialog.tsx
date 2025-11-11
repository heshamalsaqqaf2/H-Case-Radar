// components/admin/users/user-edit-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Mail, User } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateUserProfile } from "@/lib/authorization/hooks/admin/use-users";
import type { UpdateUserInput, UserWithRoles } from "@/lib/authorization/types/user";
import { updateUserSchema } from "@/lib/authorization/validators/admin/user-validator";

interface UserEditDialogProps {
  user: UserWithRoles;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const updateProfileMutation = useUpdateUserProfile();

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email,
      banned: user.banned || false,
      banReason: user.banReason || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name || "",
        email: user.email,
        banned: user.banned || false,
        banReason: user.banReason || "",
      });
    }
  }, [user, open, form]);

  const onSubmit = async (data: UpdateUserInput) => {
    try {
      await updateProfileMutation.mutateAsync({
        targetUserId: user.id,
        updates: data,
      });
      onOpenChange(false);
    } catch (error) {
      // الخطأ معالج تلقائياً في useAdminMutation
      console.error(error);
    }
  };

  const isFormDirty = form.formState.isDirty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تعديل المستخدم</DialogTitle>
        </DialogHeader>

        {/* معلومات المستخدم */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
              <User className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium">{user.name}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.banned ? "destructive" : "default"}>
                {user.banned ? "محظور" : "نشط"}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(user.createdAt).toLocaleDateString("en-US")}
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل الاسم الكامل..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="أدخل البريد الإلكتروني..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">حظر المستخدم</FormLabel>
                    <FormDescription>منع المستخدم من الوصول إلى النظام</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("banned") && (
              <FormField
                control={form.control}
                name="banReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سبب الحظر</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="أدخل سبب حظر المستخدم..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending || !isFormDirty}>
                {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
