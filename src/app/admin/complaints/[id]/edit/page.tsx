// app/admin/complaints/[id]/edit/page.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <> */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CalendarIcon,
  CheckCircle2,
  ClipboardList,
  Clock,
  Cpu,
  DollarSign,
  FileText,
  Flag,
  FolderOpen,
  Globe,
  Inbox,
  Loader2,
  Mail,
  MoreHorizontal,
  Package,
  Phone,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  Star,
  Tag,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useRef, useState } from "react";

import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useAssignableUsers,
  useComplaintDetail,
  useUpdateComplaint,
} from "@/lib/complaints/hooks/use-complaints";
import type { ComplaintWithUserDetails } from "@/lib/complaints/types/type-complaints";
import {
  type UpdateComplaintInput,
  updateComplaintSchema,
} from "@/lib/complaints/validators/complaint-validator";
import { cn } from "@/lib/utils";
import { ComplaintInfoCard } from "../../components/complaint-info-card";

const mockCategories = [
  {
    id: "technical",
    name: "فنية",
    icon: <Wrench className="h-4 w-4 text-blue-600" />,
    description: "مشاكل تقنية وفنية",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: "administrative",
    name: "إدارية",
    icon: <ClipboardList className="h-4 w-4 text-green-600" />,
    description: "قضايا إدارية وتنظيمية",
    color: "text-green-600 bg-green-50 border-green-200",
  },
  {
    id: "financial",
    name: "مالية",
    icon: <DollarSign className="h-4 w-4 text-amber-600" />,
    description: "شؤون مالية ومحاسبية",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: "customer_service",
    name: "خدمة عملاء",
    icon: <Users className="h-4 w-4 text-purple-600" />,
    description: "استفسارات ودعم العملاء",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    id: "products",
    name: "منتجات",
    icon: <Package className="h-4 w-4 text-indigo-600" />,
    description: "مشاكل متعلقة بالمنتجات",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    id: "other",
    name: "أخرى",
    icon: <MoreHorizontal className="h-4 w-4 text-gray-600" />,
    description: "فئات أخرى غير مصنفة",
    color: "text-gray-600 bg-gray-50 border-gray-200",
  },
];
const sourceOptions = [
  {
    value: "web_form",
    label: "نموذج الويب",
    icon: <Globe className="h-4 w-4 text-blue-500" />,
    description: "تم الإرسال عبر موقع الويب",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    value: "email",
    label: "البريد الإلكتروني",
    icon: <Mail className="h-4 w-4 text-green-500" />,
    description: "تم الاستلام عبر البريد الإلكتروني",
    color: "text-green-600 bg-green-50 border-green-200",
  },
  {
    value: "phone",
    label: "مركز الاتصالات",
    icon: <Phone className="h-4 w-4 text-purple-500" />,
    description: "تم الاستقبال عبر الهاتف",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    value: "mobile_app",
    label: "تطبيق الجوال",
    icon: <Smartphone className="h-4 w-4 text-orange-500" />,
    description: "تم الإرسال عبر تطبيق الجوال",
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  {
    value: "api",
    label: "واجهة برمجة التطبيقات",
    icon: <Cpu className="h-4 w-4 text-indigo-500" />,
    description: "تم الاستلام عبر API",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
];
const statusOptions = [
  {
    value: "open",
    label: "مفتوحة",
    icon: <Clock className="h-4 w-4 text-blue-500" />,
    description: "الشكوى مفتوحة وتنتظر المعالجة",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    value: "in_progress",
    label: "قيد المعالجة",
    icon: <TrendingUp className="h-4 w-4 text-orange-500" />,
    description: "جاري العمل على حل الشكوى",
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  {
    value: "resolved",
    label: "تم الحل",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    description: "تم حل الشكوى بنجاح",
    color: "text-green-600 bg-green-50 border-green-200",
  },
  {
    value: "closed",
    label: "مغلقة",
    icon: <Shield className="h-4 w-4 text-gray-500" />,
    description: "الشكوى مغلقة ومنتهية",
    color: "text-gray-600 bg-gray-50 border-gray-200",
  },
  {
    value: "unresolved",
    label: "غير محلولة",
    icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
    description: "لم يتمكن من حل الشكوى",
    color: "text-red-600 bg-red-50 border-red-200",
  },
  {
    value: "escalated",
    label: "مُصعدة",
    icon: <TrendingUp className="h-4 w-4 text-purple-500" />,
    description: "تم تصعيد الشكوى لمستوى أعلى",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    value: "on_hold",
    label: "معلقة",
    icon: <Clock className="h-4 w-4 text-yellow-500" />,
    description: "الشكوى متوقفة بانتظار معلومات",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  {
    value: "reopened",
    label: "معاد فتحها",
    icon: <RefreshCw className="h-4 w-4 text-indigo-500" />,
    description: "تم إعادة فتح الشكوى مرة أخرى",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
];
const priorityOptions = [
  {
    value: "low",
    label: "منخفضة",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Star className="h-3 w-3" />,
    level: 1,
  },
  {
    value: "medium",
    label: "متوسطة",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Star className="h-3 w-3 fill-current" />,
    level: 2,
  },
  {
    value: "high",
    label: "عالية",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <Star className="h-3 w-3 fill-current" />,
    level: 3,
  },
  {
    value: "critical",
    label: "حرجة",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <AlertTriangle className="h-3 w-3" />,
    level: 4,
  },
];
const escalationOptions = [
  {
    value: "none",
    label: "بدون تصعيد",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    description: "لم يتم تصعيد الشكوى",
    level: "مستوى أساسي",
  },
  {
    value: "level_1",
    label: "المستوى الأول",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "تصعيد لمشرف القسم",
    level: "مشرف القسم",
  },
  {
    value: "level_2",
    label: "المستوى الثاني",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "تصعيد لمدير الإدارة",
    level: "مدير الإدارة",
  },
  {
    value: "level_3",
    label: "المستوى الثالث",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "تصعيد للإدارة العليا",
    level: "الإدارة العليا",
  },
];

export default function EditComplaintPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const complaintId = resolvedParams.id;

  // --- جلب البيانات ---
  const { data: complaintResult, isLoading: complaintLoading, error } = useComplaintDetail(complaintId);
  const complaint = complaintResult?.success ? complaintResult.data : null;
  const { data: usersData, isLoading: usersLoading } = useAssignableUsers();

  // Extract users from ApiResponse
  const users = usersData?.success ? usersData.data : [];

  // --- حالات التحميل ---
  if (complaintLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container mx-auto py-10 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              خطأ
            </CardTitle>
            <CardDescription>
              {error ? "حدث خطأ في جلب بيانات الشكوى." : "الشكوى غير موجودة."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/complaints">
              <Button variant="outline">
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة إلى القائمة
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/complaints/${complaintId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">تعديل الشكوى</h1>
            <p className="text-muted-foreground">
              #{complaint.id} - {complaint.title}
            </p>
          </div>
        </div>
      </div>

      <ComplaintForm complaint={complaint} users={users} />
    </div>
  );
}

const getSafeValue = <T,>(value: T | null | undefined, defaultValue: T): T => {
  return value ?? defaultValue;
};

interface DatePickerFieldProps {
  field: any;
  label: string;
  disabled?: boolean;
}
const DatePickerField = ({ field, label, disabled }: DatePickerFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
              disabled={disabled}
              type="button"
            >
              {field.value ? format(field.value, "PPP", { locale: ar }) : <span>اختر تاريخاً</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={(date) => {
              field.onChange(date);
              setOpen(false);
            }}
            initialFocus
            disabled={disabled}
          />
          {field.value && (
            <div className="p-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  field.onChange(undefined);
                  setOpen(false);
                }}
                disabled={disabled}
              >
                حذف التاريخ
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

interface OptimizedTagsListProps {
  tags: string[];
  onRemove: (tag: string) => void;
}
const OptimizedTagsList = ({ tags, onRemove }: OptimizedTagsListProps) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {tags.map((tag) => (
      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
        {tag}
        <button
          type="button"
          onClick={() => onRemove(tag)}
          className="rounded-full hover:bg-secondary-foreground/20 p-0.5"
          aria-label={`إزالة الوسم ${tag}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    ))}
  </div>
);

interface OptimizedAttachmentsListProps {
  attachments: string[];
  onRemove: (attachment: string) => void;
}
const OptimizedAttachmentsList = ({ attachments, onRemove }: OptimizedAttachmentsListProps) => (
  <div className="space-y-2 mt-2">
    {attachments.map((attachment, index) => (
      <div
        key={`${attachment}-${index}`}
        className="flex items-center justify-between bg-gray-50 p-2 rounded"
      >
        <span className="text-sm truncate flex-1">{attachment}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(attachment)}
          aria-label={`إزالة المرفق ${attachment}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ))}
  </div>
);

//  ⚡ المكون الرئيسي
interface ComplaintFormProps {
  complaint: ComplaintWithUserDetails;
  users: { id: string; name: string; email: string }[];
}
function ComplaintForm({ complaint, users }: ComplaintFormProps) {
  const router = useRouter();
  const updateComplaintMutation = useUpdateComplaint();

  // ⚡ استخدام useRef للتحسينات
  const tagInputRef = useRef<HTMLInputElement>(null);
  const isSavingRef = useRef(false);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ⚡ defaultValues محسنة
  const defaultValues: UpdateComplaintInput = {
    id: complaint.id,
    title: getSafeValue(complaint.title, ""),
    description: getSafeValue(complaint.description, ""),
    status: getSafeValue(complaint.status, "open"),
    category: getSafeValue(complaint.category, ""),
    priority: getSafeValue(complaint.priority, "low"),
    source: getSafeValue(complaint.source, "web_form"),
    tags: getSafeValue(complaint.tags, []),
    attachments: getSafeValue(complaint.attachments, []),
    assignedTo: getSafeValue(complaint.assignedTo, undefined),
    escalationLevel: getSafeValue(complaint.escalationLevel, "none"),
    isUrgent: getSafeValue(complaint.isUrgent, false),
    responseDueAt: complaint.responseDueAt ? new Date(complaint.responseDueAt) : undefined,
    expectedResolutionDate: complaint.expectedResolutionDate
      ? new Date(complaint.expectedResolutionDate)
      : undefined,
    resolutionNotes: getSafeValue(complaint.resolutionNotes, ""),
    reopenReason: getSafeValue(complaint.reopenReason, ""),
  };

  const form = useForm<UpdateComplaintInput>({
    resolver: zodResolver(updateComplaintSchema),
    defaultValues,
    mode: "onChange",
  });

  // ⚡ استخدام useWatch للأداء الأمثل
  const watchTags = useWatch({ control: form.control, name: "tags" }) || [];
  const watchStatus = useWatch({ control: form.control, name: "status" });
  const watchAttachments = useWatch({ control: form.control, name: "attachments" }) || [];
  const { isDirty } = form.formState;

  // ⚡ دوال محسنة باستخدام useCallback
  const handleAssignedToChange = useCallback(
    (value: string) => {
      form.setValue("assignedTo", value === "NotAssigned" ? undefined : value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const handleAddTag = useCallback(() => {
    const trimmedInput = tagInput.trim();
    if (trimmedInput && !watchTags.includes(trimmedInput)) {
      form.setValue("tags", [...watchTags, trimmedInput], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setTagInput("");
      tagInputRef.current?.focus();
    }
  }, [tagInput, watchTags, form]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      form.setValue(
        "tags",
        watchTags.filter((tag) => tag !== tagToRemove),
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    },
    [watchTags, form],
  );

  const handleAddAttachment = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newAttachments = files.map((file) => file.name);
      const uniqueNewAttachments = newAttachments.filter((name) => !watchAttachments.includes(name));

      if (uniqueNewAttachments.length > 0) {
        form.setValue("attachments", [...watchAttachments, ...uniqueNewAttachments], {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      e.target.value = "";
    },
    [watchAttachments, form],
  );

  const handleRemoveAttachment = useCallback(
    (attachmentToRemove: string) => {
      form.setValue(
        "attachments",
        watchAttachments.filter((attachment) => attachment !== attachmentToRemove),
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    },
    [watchAttachments, form],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag],
  );

  const onSubmit = useCallback(
    async (values: UpdateComplaintInput) => {
      if (isSavingRef.current) return;

      isSavingRef.current = true;
      setIsSaving(true);

      try {
        // Sanitize null values to undefined for type compatibility
        const sanitizedValues: UpdateComplaintInput = {
          ...values,
          assignedTo: values.assignedTo ?? undefined,
          responseDueAt: values.responseDueAt ?? undefined,
          expectedResolutionDate: values.expectedResolutionDate ?? undefined,
        };

        await updateComplaintMutation.mutateAsync(sanitizedValues);
        router.push(`/admin/complaints/${complaint.id}`);
      } catch (error) {
        console.error("Error updating complaint:", error);
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [updateComplaintMutation, router, complaint.id],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* ⚡ العمود الايسر - النموذج */}
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  البيانات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* العنوان والوصف */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل عنوان الشكوى" {...field} disabled={isSaving} />
                        </FormControl>
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
                          <Textarea
                            placeholder="صف الشكوى بالتفصيل"
                            className="min-h-[100px]"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* الحالة والأولوية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel className="flex items-center gap-2 mb-2 text-sm font-semibold">
                          <Flag className="h-4 w-4 text-muted-foreground" />
                          حالة الشكوى
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                          <FormControl className="py-2">
                            <SelectTrigger className="w-full bg-background py-6 border-input hover:border-primary transition-colors">
                              <SelectValue placeholder="اختر الحالة..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {statusOptions.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="cursor-pointer transition-colors hover:bg-muted"
                              >
                                <div className="flex items-center gap-2 py-1">
                                  <div className={cn("p-1.5 rounded-lg", opt.color)}>{opt.icon}</div>
                                  <div className="flex flex-col text-start">
                                    <span className="font-medium text-sm">{opt.label}</span>
                                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-1 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel className="flex items-center gap-2 mb-2 text-sm font-semibold">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          مستوى الأولوية
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-background border-input hover:border-primary transition-colors">
                              <SelectValue placeholder="اختر مستوى الأولوية..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {priorityOptions.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="cursor-pointer transition-colors hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-3 py-1">
                                  <div className={cn("p-2 rounded-full", opt.color)}>{opt.icon}</div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">{opt.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      المستوى {opt.level} من 4
                                    </span>
                                  </div>
                                  <div className="ml-auto">
                                    <Badge variant="outline" className={opt.color}>
                                      {opt.level}/4
                                    </Badge>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-1 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* التضنيفات والمصادر */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel className="flex items-center gap-2 mb-2 text-sm font-semibold">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          تصنيف الشكوى
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSaving}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-background h-10 border-input hover:border-primary transition-colors">
                              <SelectValue placeholder="اختر التصنيف..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {mockCategories.map((cat) => (
                              <SelectItem
                                key={cat.id}
                                value={cat.id}
                                className="cursor-pointer transition-colors hover:bg-muted"
                              >
                                <div className="flex items-center gap-3 py-1">
                                  <div className={cn("p-1.5 rounded-lg", cat.color)}>{cat.icon}</div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">{cat.name}</span>
                                    <span className="text-xs text-muted-foreground">{cat.description}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-1 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel className="flex items-center gap-2 mb-2 text-sm font-semibold">
                          <Inbox className="h-4 w-4 text-muted-foreground" />
                          مصدر الشكوى
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-background h-10 border-input hover:border-primary transition-colors">
                              <SelectValue placeholder="اختر المصدر..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {sourceOptions.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="cursor-pointer transition-colors hover:bg-muted"
                              >
                                <div className="flex items-center gap-3 py-1">
                                  <div className={cn("p-1.5 rounded-lg", opt.color)}>{opt.icon}</div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">{opt.label}</span>
                                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="mt-1 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* التصعيد والتعيين */}
                <div className="flex flex-col md:flex-row gap-6">
                  <FormField
                    control={form.control}
                    name="escalationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مستوى التصعيد</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر مستوى التصعيد" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {escalationOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <Badge className={opt.color}>{opt.label}</Badge>
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
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المُعيّن إليه</FormLabel>
                        <Select
                          onValueChange={handleAssignedToChange}
                          value={field.value || ""}
                          disabled={isSaving}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="اختر الموظف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NotAssigned">لا أحد</SelectItem>
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
                </div>

                {/* التواريخ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="responseDueAt"
                    render={({ field }) => <DatePickerField field={field} label="موعد الاستجابة" />}
                  />

                  <FormField
                    control={form.control}
                    name="expectedResolutionDate"
                    render={({ field }) => <DatePickerField field={field} label="تاريخ الحل المتوقع" />}
                  />
                </div>

                {/* ملاحظات الحل - تظهر فقط عندما تكون الحالة resolved */}
                {watchStatus === "resolved" && (
                  <FormField
                    control={form.control}
                    name="resolutionNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات الحل</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل ملاحظات الحل"
                            className="min-h-[80px]"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* سبب إعادة الفتح - يظهر فقط عند اختيار حالة "reopened" */}
                {watchStatus === "reopened" && (
                  <FormField
                    control={form.control}
                    name="reopenReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سبب إعادة الفتح</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل سبب إعادة فتح الشكوى"
                            className="min-h-[80px]"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Separator />

                {/* خيارات إضافية */}
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="isUrgent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none mr-2">
                          <FormLabel>عاجلة</FormLabel>
                          <FormDescription>تحديد هذه الشكوى كعاجلة</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* الوسوم */}
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      الوسوم
                    </FormLabel>
                    <div className="flex gap-2">
                      <Input
                        ref={tagInputRef}
                        placeholder="أضف وسماً..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSaving}
                      />
                      <Button type="button" onClick={handleAddTag} disabled={isSaving || !tagInput.trim()}>
                        إضافة
                      </Button>
                    </div>
                    {watchTags.length > 0 && (
                      <OptimizedTagsList tags={watchTags} onRemove={handleRemoveTag} />
                    )}
                  </div>

                  {/* المرفقات */}
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      المرفقات
                    </FormLabel>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="space-y-1 text-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>رفع ملف</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            onChange={handleAddAttachment}
                            disabled={isSaving}
                          />
                        </label>
                        <p className="pl-1 inline">أو اسحب وأفلت</p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG, GIF حتى 10MB</p>
                      </div>
                    </div>

                    {watchAttachments.length > 0 && (
                      <OptimizedAttachmentsList
                        attachments={watchAttachments}
                        onRemove={handleRemoveAttachment}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-primary" disabled={isSaving || !isDirty}>
                {isSaving ? (
                  <>
                    <Spinner />
                    جاري الحفظ
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* ⚡ العمود الايمن - معلومات الشكوى */}
      <div className="lg:col-span-1">
        <ComplaintInfoCard complaint={complaint} />
      </div>
    </div>
  );
}
