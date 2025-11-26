// src/components/admin/roles/create-role-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateRole } from "@/lib/authorization/hooks/admin/use-roles";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "يجب أن يكون 2 أحرف")
    .max(50, "يجب أن يكون الاسم أقل من 50 حرف")
    .regex(/^[a-zA-Z0-9_]+$/, "يمكن أن يحتوي الاسم على أحرف وأرقام وشرطات سفلية فقط"),
  description: z.string().min(5, "يجب أن يكون  5 أحرف").max(200, "يجب أن يكون الوصف أقل من 200 حرف"),
  isDefault: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateRoleForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const createRoleMutation = useCreateRole();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    await createRoleMutation.mutateAsync(data, {
      onSuccess: (result) => {
        if (result.success) {
          form.reset();
          setIsOpen(false);
          onSuccess?.();
          window.location.reload();
        }
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-row-reverse">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إنشاء دور جديد
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إنشاء دور جديد</DialogTitle>
          <DialogDescription>إضافة دور جديد إلى النظام, وتعيين صلاحيات لهذا الدور.</DialogDescription>
        </DialogHeader>
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
                  <FormDescription>معرف فريد للدور. استخدم الأحرف الصغيرة مع علامات التسطير.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الدور</FormLabel>
                  <FormControl>
                    <Textarea placeholder="صف ما يمكن أن يفعله هذا الدور..." {...field} />
                  </FormControl>
                  <FormDescription>وصف موجز لغرض الدور والأذونات.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>دور إفتراضي</FormLabel>
                    <FormDescription>تعيين هذا الدور للمستخدمين الجدد تلقائيًا</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3 rtl:flex-row-reverse">
              <Button type="submit" disabled={createRoleMutation.isPending} className="gap-2">
                {createRoleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                إنشاء الدور
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={createRoleMutation.isPending}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
