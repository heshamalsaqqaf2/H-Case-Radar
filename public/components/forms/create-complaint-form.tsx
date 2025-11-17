"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCreateComplaint } from "@/lib/complaints/hooks/use-complaints";
import type { CreateComplaintInput } from "@/lib/complaints/types/type-complaints";
import { createComplaintSchema } from "@/lib/complaints/validators/complaint-validator";

// بيانات وهمية للاختيار من القوائم
const categories = [
  { value: "technical", label: "مشاكل تقنية" },
  { value: "billing", label: "فواتير ومدفوعات" },
  { value: "service", label: "جودة الخدمة" },
  { value: "account", label: "مشاكل الحساب" },
  { value: "other", label: "أخرى" },
];

const users = [
  { value: "user1", label: "أحمد محمد" },
  { value: "user2", label: "فاطمة علي" },
  { value: "user3", label: "خالد إبراهيم" },
];

export function CreateComplaintForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createComplaint = useCreateComplaint();

  const form = useForm<CreateComplaintInput>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      source: "web_form",
      assignedTo: "",
      tags: [],
      attachments: [],
      escalationLevel: "none",
      isUrgent: false,
    } as CreateComplaintInput,
  });
  // const form = useForm<CreateComplaintInput>({
  //   resolver: zodResolver(createComplaintSchema),
  //   defaultValues: {
  //     title: "",
  //     description: "",
  //     category: "",
  //     priority: "medium",
  //     source: "web_form",
  //     assignedTo: "",
  //     tags: [],
  //     isUrgent: false,
  //   },
  // });

  async function onSubmit(data: CreateComplaintInput) {
    setIsSubmitting(true);
    try {
      await createComplaint.mutateAsync(data);
      router.push("/admin/complaints");
    } catch (error) {
      console.error("Error creating complaint:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>معلومات الشكوى</CardTitle>
          <CardDescription>أدخل تفاصيل الشكوى الجديدة مع جميع المعلومات المطلوبة</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* العنوان */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الشكوى</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنوان واضح للشكوى" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* الوصف */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف مفصل</FormLabel>
                    <FormControl>
                      <Textarea placeholder="صف المشكلة بالتفصيل..." className="min-h-32" {...field} />
                    </FormControl>
                    <FormDescription>اشرح المشكلة بدقة مع ذكر جميع التفاصيل المهمة</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الفئة */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر فئة الشكوى" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* الأولوية */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مستوى الأولوية</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر مستوى الأولوية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">منخفض</SelectItem>
                          <SelectItem value="medium">متوسط</SelectItem>
                          <SelectItem value="high">عالي</SelectItem>
                          <SelectItem value="critical">حرج</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* المسند إلى */}
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تعيين إلى</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المسؤول" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.value} value={user.value}>
                              {user.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* مصدر الشكوى */}
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مصدر الشكوى</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المصدر" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="web_form">نموذج ويب</SelectItem>
                          <SelectItem value="email">بريد إلكتروني</SelectItem>
                          <SelectItem value="phone">هاتف</SelectItem>
                          <SelectItem value="mobile_app">تطبيق جوال</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-4 justify-end pt-6">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/complaints")}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      إنشاء الشكوى
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
