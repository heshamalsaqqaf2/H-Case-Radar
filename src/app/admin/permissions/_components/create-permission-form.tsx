"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { createPermissionAction } from "@/lib/authorization/actions/admin/permission-actions";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Name can only contain letters, numbers, dots, underscores, and hyphens"),
  description: z.string().max(200).optional(),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
  conditions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePermissionForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      resource: "",
      action: "",
      conditions: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    if (data.conditions) {
      try {
        JSON.parse(data.conditions);
      } catch {
        toast.error("Invalid JSON in conditions");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("resource", data.resource);
    formData.append("action", data.action);
    if (data.conditions) formData.append("conditions", data.conditions);

    startTransition(async () => {
      const result = await createPermissionAction(formData);
      if (result.success) {
        toast.success("نجحت العملية", { description: result.success });
        form.reset();
        setOpen(false);
      } else {
        toast.error("فشلت العملية", { description: result.error.message });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Key className="mr-2 h-4 w-4" /> انشاء صلاحية
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            إنشاء صلاحية جديدة
          </DialogTitle>
          <DialogDescription>
            تحديد صلاحية جديدة للنظام
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>إسم الصلاحية</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., user.create, post.delete.own" {...field} />
                  </FormControl>
                  <FormDescription>المعرف الفريد لهذا الإذن (مثل: user.create)</FormDescription>
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
                    <Textarea placeholder="صف ما يسمح به هذا الإذن..." {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المصدر</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., user, post, admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الإجراء</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر إجراء" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="view">عرض</SelectItem>
                        <SelectItem value="create">إنشاء</SelectItem>
                        <SelectItem value="update">تحديث</SelectItem>
                        <SelectItem value="delete">حذف</SelectItem>
                        <SelectItem value="manage">إدارة</SelectItem>
                        <SelectItem value="assign">تعيين</SelectItem>
                        <SelectItem value="status">حالة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شروط (ABAC) اختيارية</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`{\n  "department": "IT",\n  "level": { "gte": 3 }\n}`}
                      {...field}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </FormControl>
                  <FormDescription>
                    كائن JSON للوصول المشروط (ABAC). اتركه فارغًا إذا لم تكن هناك شروط.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جار إنشاء الصلاحية...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  إنشاء الصلاحية
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
