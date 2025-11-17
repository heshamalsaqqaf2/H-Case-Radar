// components/complaints/create-complaint-dialog.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, Upload, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUsers } from "@/lib/authorization/hooks/admin";
import { useCreateComplaint } from "@/lib/complaints/hooks/use-complaints";
import type { CreateComplaintInput } from "@/lib/complaints/types/type-complaints";
import { createComplaintSchema } from "@/lib/complaints/validators/complaint-validator";
import { cn } from "@/lib/utils";

// const localFormSchema = z.object({
//   title: z.string().min(5, "يجب أن يحتوي العنوان على 5 أحرف على الأقل").max(255),
//   description: z.string().min(10, "يجب أن تحتوي الوصف على 10 أحرف على الأقل"),
//   category: z.string().min(1, "التصنيف مطلوب"),
//   priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
//   source: z.enum(["web_form", "email", "phone", "mobile_app", "api"]).default("web_form"),
//   tags: z.array(z.string()).default([]),
//   attachments: z.array(z.string()).default([]),
//   assignedTo: z.string().min(1, "يجب تعيين مستخدم للشكوى"),
//   escalationLevel: z.enum(["none", "level_1", "level_2", "level_3"]).default("none"),
//   responseDueAt: z.date().optional(), // استخدام z.date بدلاً من z.coerce.date
//   expectedResolutionDate: z.date().optional(), // استخدام z.date بدلاً من z.coerce.date
//   isUrgent: z.boolean().default(false),
// });

// type FormDataType = Omit<CreateComplaintInput, "responseDueAt" | "expectedResolutionDate"> & {
//   responseDueAt?: Date;
//   expectedResolutionDate?: Date;
// };

// تعريف الخيارات

const mockCategories = [
  { id: "technical", name: "فنية" },
  { id: "administrative", name: "إدارية" },
  { id: "financial", name: "مالية" },
  { id: "customer_service", name: "خدمة عملاء" },
  { id: "products", name: "منتجات" },
  { id: "other", name: "أخرى" },
];
const priorityOptions = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "critical", label: "حرجة" },
];

const sourceOptions = [
  { value: "web_form", label: "نموذج الويب" },
  { value: "email", label: "البريد الإلكتروني" },
  { value: "phone", label: "الهاتف" },
  { value: "mobile_app", label: "تطبيق الجوال" },
  { value: "api", label: "API" },
];

const escalationOptions = [
  { value: "none", label: "بدون تصعيد" },
  { value: "level_1", label: "تصعيد إلى المستوى الأول" },
  { value: "level_2", label: "تصعيد إلى المستوى الثاني" },
  { value: "level_3", label: "تصعيد إلى المستوى الثالث" },
];

interface CreateComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function CreateComplaintDialog({ open, onOpenChange }: CreateComplaintDialogProps) {
  const [tagInput, setTagInput] = useState("");
  const createComplaintMutation = useCreateComplaint();

  const { data: usersData } = useUsers();
  const users = usersData?.success ? usersData.data : [];

  const form = useForm({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "low",
      source: "web_form",
      tags: [],
      attachments: [],
      assignedTo: "",
      escalationLevel: "none",
      isUrgent: false,
    },
  });

  const watchTags = form.watch("tags") || [];
  const watchAttachments = form.watch("attachments") || [];

  const handleAddTag = () => {
    if (tagInput.trim() && !watchTags.includes(tagInput.trim())) {
      form.setValue("tags", [...watchTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      watchTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => file.name);
    form.setValue("attachments", [...watchAttachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (attachmentToRemove: string) => {
    form.setValue(
      "attachments",
      watchAttachments.filter((attachment) => attachment !== attachmentToRemove),
    );
  };

  const onSubmit = (values: z.infer<typeof createComplaintSchema>) => {
    // تحويل البيانات إلى النوع المتوقع من الـ API (CreateComplaintInput)
    const submissionData: CreateComplaintInput = {
      ...values,
      tags: values.tags,
      attachments: values.attachments,
      responseDueAt: values.responseDueAt,
      expectedResolutionDate: values.expectedResolutionDate,
    };

    createComplaintMutation.mutate(submissionData, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء شكوى جديدة</DialogTitle>
          <DialogDescription>أدخل تفاصيل الشكوى الجديدة. املأ جميع الحقول المطلوبة.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الشكوى</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنوان الشكوى" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الشكوى</FormLabel>
                  <FormControl>
                    <Textarea placeholder="صف الشكوى بالتفصيل" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الأولوية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {sourceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المُعيّن إليه</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الموظف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="escalationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مستوى التصعيد</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مستوى التصعيد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {escalationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="responseDueAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>موعد الاستجابة</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر تاريخاً</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedResolutionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ الحل المتوقع</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر تاريخاً</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>عاجلة</FormLabel>
                    <FormDescription>تحديد هذه الشكوى كعاجلة تتطلب اهتماماً فورياً</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* الوسوم */}
            <div className="space-y-2">
              <FormLabel>الوسوم</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="أضف وسماً..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  إضافة
                </Button>
              </div>

              {watchTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="rounded-full hover:bg-secondary-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* المرفقات */}
            <div className="space-y-2">
              <FormLabel>المرفقات</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="space-y-1 text-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <span>رفع ملف</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleAddAttachment}
                    />
                  </label>
                  <p className="pl-1">أو اسحب وأفلت</p>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG, GIF حتى 10MB</p>
                </div>
              </div>

              {watchAttachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {watchAttachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{attachment}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttachment(attachment)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createComplaintMutation.isPending}>
                {createComplaintMutation.isPending ? "جاري الإنشاء..." : "إنشاء شكوى"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
