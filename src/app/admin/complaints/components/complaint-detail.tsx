// components/complaints/complaint-detail.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FileText,
  MessageSquare,
  Paperclip,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAddComment,
  useComplaintDetail,
  useComplaintProfile,
} from "@/lib/complaints/hooks/use-complaints";
import { ComplaintActions } from "./complaint-actions";
import { ComplaintCommentForm } from "./complaint-comment-form";
import { ComplaintTimeline } from "./complaint-timeline";

interface ComplaintDetailProps {
  complaintId: string;
}

export function ComplaintDetail({ complaintId }: ComplaintDetailProps) {
  const [activeTab, setActiveTab] = useState("details");

  const { data: complaintResult, isLoading, error } = useComplaintDetail(complaintId);
  const { data: profileResult } = useComplaintProfile(complaintId);
  const addCommentMutation = useAddComment();

  const complaint = complaintResult?.success ? complaintResult.data : null;
  const profile = profileResult?.success ? profileResult.data : null;

  const handleAddComment = (body: string) => {
    addCommentMutation.mutate({ complaintId, body });
  };

  if (isLoading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ: {error instanceof Error ? error.message : "خطأ غير معروف"}</div>;
  if (!complaint) return <div>الشكوى غير موجودة</div>;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "مفتوحة", variant: "default" as const },
      in_progress: { label: "قيد التنفيذ", variant: "secondary" as const },
      resolved: { label: "تم الحل", variant: "default" as const },
      closed: { label: "مغلقة", variant: "outline" as const },
      unresolved: { label: "لم تحل", variant: "destructive" as const },
      escalated: { label: "مُصعّدة", variant: "secondary" as const },
      on_hold: { label: "معلقة", variant: "outline" as const },
      reopened: { label: "أُعيد فتحها", variant: "secondary" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "منخفضة", variant: "outline" as const },
      medium: { label: "متوسطة", variant: "secondary" as const },
      high: { label: "عالية", variant: "default" as const },
      critical: { label: "حرجة", variant: "destructive" as const },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/complaints">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة إلى القائمة
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {complaint.isUrgent && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              عاجلة
            </Badge>
          )}
          {getStatusBadge(complaint.status)}
          {getPriorityBadge(complaint.priority)}
        </div>
      </div>

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
                  <Link href={`/admin/complaints/${complaint.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      تعديل
                    </Button>
                  </Link>
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
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
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
                      <Badge key={index} variant="secondary">
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
                      <p>
                        {complaint.responseDueAt
                          ? formatDistanceToNow(new Date(complaint.responseDueAt), {
                              addSuffix: true,
                              locale: ar,
                            })
                          : "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">تاريخ الحل المتوقع</h4>
                      <p>
                        {complaint.expectedResolutionDate
                          ? formatDistanceToNow(new Date(complaint.expectedResolutionDate), {
                              addSuffix: true,
                              locale: ar,
                            })
                          : "غير محدد"}
                      </p>
                    </div>
                  </div>

                  {complaint.resolutionNotes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">ملاحظات الحل</h4>
                      <p className="p-3 bg-gray-50 rounded">{complaint.resolutionNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {profile && (
                <Card>
                  <CardHeader>
                    <CardTitle>الإحصائيات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">وقت الاستجابة</h4>
                        <p>{profile.statistics.responseTime} ساعة</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">وقت الحل</h4>
                        <p>{profile.statistics.resolutionTime} ساعة</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">الوقت الكلي</h4>
                        <p>{profile.statistics.totalTime} ساعة</p>
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
                  <ScrollArea className="h-[400px] pr-4">
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
                                <p className="text-sm">{comment.description}</p>
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
          <Card>
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
                  المُعيّن إليه
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
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
