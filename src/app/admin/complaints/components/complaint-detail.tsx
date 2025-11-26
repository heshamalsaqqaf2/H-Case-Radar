// components/complaints/complaint-detail.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Edit2,
  FileText,
  MessageSquare,
  Paperclip,
  PlusIcon,
  SlashIcon,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeaderDashboardPage } from "@/components/admin/header-dashboard-page";
import { DashboardError } from "@/components/dashboard/errors/error-state";
import { EmotionalLoading } from "@/components/shared/loading-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAddComment,
  useComplaintDetail,
  useComplaintProfile,
} from "@/lib/complaints/hooks/use-complaints";
import { ComplaintStatus } from "@/lib/complaints/state/complaint-status";
import { AppError } from "@/lib/errors/error-types";
import { AssignComplaintDialog } from "./assign-complaint-dialog";
import { ComplaintActions } from "./complaint-actions";
import { ComplaintCommentForm } from "./complaint-comment-form";
import { ComplaintTimeline } from "./complaint-timeline";

interface ComplaintDetailProps {
  complaintId: string;
}

export function ComplaintDetail({ complaintId }: ComplaintDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");

  const { data: complaintResult, isLoading, error } = useComplaintDetail(complaintId);
  const { data: profileResult } = useComplaintProfile(complaintId);
  const addCommentMutation = useAddComment();

  const complaint = complaintResult?.success ? complaintResult.data : null;
  const profile = profileResult?.success ? profileResult.data : null;

  if (isLoading) return <EmotionalLoading />;

  if (error)
    return (
      <DashboardError
        title="تعذر تحميل بيانات الشكوى"
        description="حدث خطأ في جلب بيانات الشكوى, يرجى المحاولة مرة اخرى"
        error={
          new AppError({
            message: "حدث خطاء في جلب بيانات",
            userMessage: "حدث خطاء في جلب بيانات الشكوى, يرجى المحاولة مرة اخرى",
            code: "BAD_REQUEST",
            originalError: error,
            timestamp: Date.now(),
          })
        }
        onAction={() => router.refresh()}
      />
    );

  if (!complaint)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold mb-4">لا يوجد بلاغ بهذا الرقم: {complaintId}</div>
        <Link href="/admin/complaints">
          <Button variant="outline">عودة للبلاغات</Button>
        </Link>
      </div>
    );

  const handleAddComment = (body: string) => {
    addCommentMutation.mutate({ complaintId, body });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "مفتوحة", className: "bg-blue-500" as const },
      in_progress: { label: "قيد التنفيذ", className: "bg-yellow-500" as const },
      resolved: { label: "تم الحل", className: "bg-green-400" as const },
      closed: { label: "مغلقة", className: "bg-rose-400" as const },
      unresolved: { label: "لم تحل", className: "bg-red-400" as const },
      escalated: { label: "مُصعّدة", className: "bg-violet-600" as const },
      on_hold: { label: "معلقة", className: "bg-amber-600" as const },
      reopened: { label: "أُعيد فتحها", className: "bg-emerald-500" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "Low", className: "bg-blue-500" as const },
      medium: { label: "Medium", className: "bg-yellow-500" as const },
      high: { label: "High", className: "bg-rose-500" as const },
      critical: { label: "Critical", className: "bg-red-600" as const },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // ✅ دالة مساعدة لتنسيق الوقت مع التعامل مع القيم الفارغة
  const formatHours = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) {
      return "غير مطبق"; // أو "في انتظار الإجراء"
    }
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} دقيقة`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h} ساعة و ${m} دقيقة` : `${h} ساعة`;
  };

  // ✅ دالة مساعدة لتنسيق التواريخ (الماضي والمستقبل) بشكل صحيح
  const formatDateDistance = (date: string | Date | null | undefined): string => {
    if (!date) return "غير محدد";
    const dateObj = new Date(date);
    const now = new Date();
    const isFuture = dateObj > now;

    const distance = formatDistanceToNow(dateObj, { locale: ar });

    // إذا كان التاريخ في المستقبل، نستبدل "منذ" بكلمة مناسبة
    if (isFuture) {
      return distance.replace("منذ", "خلال");
    }

    // إذا كان التاريخ في الماضي، "منذ" صحيحة
    return distance;
  };

  return (
    <div className="space-y-6 px-4">
      {/* Headers page informations */}
      <HeaderDashboardPage
        title="تفاصيل معلومات البلاغ"
        description="صفحة معلومات البلاغ, يمكنك من تعديل بيانات البلاغ هنا"
        actions={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard" className="text-blue-500">
                  الرئيسيــة
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/complaints" className="text-blue-500">
                  إدارة البلاغـــات
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{complaint.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/complaints">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة إلى القائمة
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {complaint.isUrgent && (
              <Badge className="bg-red-500 text-white flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                عاجلة
              </Badge>
            )}
            {getStatusBadge(complaint.status)}
            {getPriorityBadge(complaint.priority)}
          </div>
        </div>

        <div className="flex items-center">
          {complaint.isUrgent && (
            <p className="text-red-500 bg-red-500/10 py-1 px-4 rounded text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              هذه الشكوى عاجلة, يرجى إبلاغ ضابط الإتصال المختص بها فورا.
            </p>
          )}
        </div>
      </div>

      {/* Information Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{complaint.title}</CardTitle>
                  <CardDescription className="mt-1">
                    #{complaint.id} • تم إنشاؤها{" "}
                    {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true, locale: ar })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {complaint.status !== ComplaintStatus.CLOSED ? (
                    <Link href={`/admin/complaints/${complaint.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="text-green-500 h-4 w-4" />
                        تعديل البلاغ
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <Edit2 className="text-green-500 h-4 w-4" />
                      لا يمكن تعديل البلاغ المغلق
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{complaint.description}</p>
              </div>

              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    المرفقات
                  </h4>
                  <div className="space-y-2">
                    {complaint.attachments.map((attachment, index) => (
                      <div key={index.toString()} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complaint.tags && complaint.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">الوسوم</h4>
                  <div className="flex flex-wrap gap-2">
                    {complaint.tags.map((tag, index) => (
                      <Badge key={index.toString()} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                التفاصيل
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                التعليقات
                {profile && (
                  <Badge variant="secondary" className="ml-1">
                    {profile.statistics.totalComments}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                الخط الزمني
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الشكوى</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">الفئة</h4>
                      <p>{complaint.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">المصدر</h4>
                      <p>{complaint.source}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">مستوى التصعيد</h4>
                      <p>{complaint.escalationLevel}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">تقييم الرضا</h4>
                      <p>{complaint.satisfactionRating || "لم يتم التقييم"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">موعد الاستجابة</h4>
                      <p>{formatDateDistance(complaint.responseDueAt)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">تاريخ الحل المتوقع</h4>
                      <p>{formatDateDistance(complaint.expectedResolutionDate)}</p>
                    </div>
                  </div>

                  {complaint.resolutionNotes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">ملاحظات الحل</h4>
                      <p className="p-3 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl">{complaint.resolutionNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {profile && (
                // <Card>
                //   <CardHeader>
                //     <CardTitle>الإحصائيات</CardTitle>
                //   </CardHeader>
                //   <CardContent>
                //     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                //       <div>
                //         <h4 className="text-sm font-medium text-gray-500">وقت الاستجابة</h4>
                //         <p>{profile.statistics.responseTime} ساعة</p>
                //       </div>
                //       <div>
                //         <h4 className="text-sm font-medium text-gray-500">وقت الحل</h4>
                //         <p>{profile.statistics.resolutionTime} ساعة</p>
                //       </div>
                //       <div>
                //         <h4 className="text-sm font-medium text-gray-500">الوقت الكلي</h4>
                //         <p>{profile.statistics.totalTime} ساعة</p>
                //       </div>
                //       <div>
                //         <h4 className="text-sm font-medium text-gray-500">عدد مرات إعادة الفتح</h4>
                //         <p>{profile.statistics.reopenCount}</p>
                //       </div>
                //     </div>
                //   </CardContent>
                // </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>الإحصائيات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">وقت الاستجابة</h4>
                        <p>{formatHours(profile.statistics.responseTime)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">وقت الحل</h4>
                        <p>{formatHours(profile.statistics.resolutionTime)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">الوقت الكلي</h4>
                        <p>{formatHours(profile.statistics.totalTime)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">عدد مرات إعادة الفتح</h4>
                        <p>{profile.statistics.reopenCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>التعليقات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[150px] pr-4">
                    {profile?.activity.filter((a) => a.type === "comment").length === 0 ? (
                      <p className="text-center text-gray-500 py-8">لا توجد تعليقات</p>
                    ) : (
                      <div className="space-y-4">
                        {profile?.activity
                          .filter((a) => a.type === "comment")
                          .map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={comment.actorName || ""} />
                                <AvatarFallback>
                                  {comment.actorName
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{comment.actorName}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(comment.timestamp), {
                                      addSuffix: true,
                                      locale: ar,
                                    })}
                                  </p>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{comment.description}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <ComplaintCommentForm onSubmit={handleAddComment} isPending={addCommentMutation.isPending} />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>الخط الزمني</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {profile?.timeline.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">لا توجد أحداث</p>
                    ) : (
                      <ComplaintTimeline timeline={profile?.timeline ?? []} />
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  المُقدم
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={complaint.submittedByUserName} />
                    <AvatarFallback>
                      {complaint.submittedByUserName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{complaint.submittedByUserName}</p>
                    <p className="text-sm text-gray-500">{complaint.submittedByUserEmail}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  المعين إليه
                </h4>
                {complaint.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-1 bg-emerald-500 ring-emerald-500">
                      <AvatarImage src="" alt={complaint.assignedUserName} />
                      <AvatarFallback>
                        {complaint.assignedUserName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{complaint.assignedUserName}</p>
                      <p className="text-sm text-gray-500">{complaint.assignedUserEmail}</p>
                    </div>
                  </div>
                ) : (
                  <Empty className="w-full">
                    <EmptyHeader>
                      <EmptyMedia>
                        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:size-12 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                          <Avatar>
                            <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                            <AvatarFallback>ER</AvatarFallback>
                          </Avatar>
                        </div>
                      </EmptyMedia>
                      <EmptyTitle>لم يتم التعيين للبلاغ بعد</EmptyTitle>
                      <EmptyDescription>
                        يمكنك تعيين هذه الشكوى إلى أحد الموظفين من خلال النقر على زر "تعيين".
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <AssignComplaintDialog complaint={complaint} />
                    </EmptyContent>
                  </Empty>
                )}

              </div>

              <Separator />
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  التواريخ
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>إنشاء:</span>
                    <span>
                      {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>آخر نشاط:</span>
                    <span>
                      {formatDistanceToNow(new Date(complaint.lastActivityAt), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  </div>
                  {complaint.resolvedAt && (
                    <div className="flex justify-between">
                      <span>حل:</span>
                      <span>
                        {formatDistanceToNow(new Date(complaint.resolvedAt), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                  )}
                  {complaint.closedAt && (
                    <div className="flex justify-between">
                      <span>إغلاق:</span>
                      <span>
                        {formatDistanceToNow(new Date(complaint.closedAt), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintActions complaint={complaint} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
