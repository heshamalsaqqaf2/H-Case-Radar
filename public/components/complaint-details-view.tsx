/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  MessageSquare,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useComplaintDetail, useComplaintProfile } from "@/lib/complaints/hooks/use-complaints";
import { ComplaintStatusBadge } from "./complaint-status-badge";
import { PriorityBadge } from "./priority-badge";

interface ComplaintDetailsViewProps {
  complaintId: string;
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      <Skeleton className="h-64" />
    </div>
  );
}

export function ComplaintDetailsView({ complaintId }: ComplaintDetailsViewProps) {
  const router = useRouter();
  const { data: complaintResult, isLoading: isLoadingDetail } = useComplaintDetail(complaintId);
  const { data: profileResult, isLoading: isLoadingProfile } = useComplaintProfile(complaintId);

  if (isLoadingDetail || isLoadingProfile) {
    return <DetailsSkeleton />;
  }

  if (!complaintResult?.success || !complaintResult.data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">الشكوى غير موجودة</h3>
        <p className="text-muted-foreground mt-2">لم نتمكن من العثور على الشكوى المطلوبة</p>
        <Button onClick={() => router.push("/admin/complaints")} className="mt-4">
          العودة إلى القائمة
        </Button>
      </div>
    );
  }

  const complaint = complaintResult.data;
  const profile = profileResult?.success ? profileResult.data : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">{complaint.title}</h2>
            <ComplaintStatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <p className="text-muted-foreground text-lg">
            {complaint.category} • أنشئت في {format(complaint.createdAt, "PPPP", { locale: ar })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/complaints")}>
            العودة للقائمة
          </Button>
          <Button>
            <Edit className="h-4 w-4 ml-2" />
            تعديل
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المسند إلى</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaint.assignedUserName}</div>
            <p className="text-xs text-muted-foreground">{complaint.assignedUserEmail}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مقدم الشكوى</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaint.submittedByUserName}</div>
            <p className="text-xs text-muted-foreground">{complaint.submittedByUserEmail}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر نشاط</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(complaint.lastActivityAt, "dd/MM/yyyy", { locale: ar })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(complaint.lastActivityAt, "p", { locale: ar })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المرفقات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaint.attachments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">ملف مرفق</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
          <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
          <TabsTrigger value="comments">التعليقات</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  وصف الشكوى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{complaint.description}</p>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المصدر:</span>
                  <Badge variant="outline">
                    {complaint.source === "web_form" && "نموذج ويب"}
                    {complaint.source === "email" && "بريد إلكتروني"}
                    {complaint.source === "phone" && "هاتف"}
                    {complaint.source === "mobile_app" && "تطبيق جوال"}
                    {complaint.source === "api" && "API"}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">مستوى التصعيد:</span>
                  <Badge variant="outline">
                    {complaint.escalationLevel === "none" && "بدون تصعيد"}
                    {complaint.escalationLevel === "level_1" && "المستوى الأول"}
                    {complaint.escalationLevel === "level_2" && "المستوى الثاني"}
                    {complaint.escalationLevel === "level_3" && "المستوى الثالث"}
                  </Badge>
                </div>

                {complaint.tags && complaint.tags.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">الوسوم:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {complaint.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {complaint.isUrgent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الحالة:</span>
                    <Badge variant="destructive">عاجل</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resolution Notes */}
          {complaint.resolutionNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  ملاحظات الحل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{complaint.resolutionNotes}</p>
                {complaint.resolvedAt && (
                  <p className="text-sm text-muted-foreground mt-2">
                    تم الحل في {format(complaint.resolvedAt, "PPPP", { locale: ar })}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>سجل النشاط</CardTitle>
              <CardDescription>جميع الأحداث والأنشطة المرتبطة بهذه الشكوى</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.activity && profile.activity.length > 0 ? (
                <div className="space-y-4">
                  {profile.activity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="bg-muted rounded-full p-2">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.actorName || "النظام"}</span>
                          <span className="text-muted-foreground text-sm">
                            {format(activity.timestamp, "PPPPp", { locale: ar })}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">لا توجد أنشطة مسجلة</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>الجدول الزمني</CardTitle>
              <CardDescription>تطور حالة الشكوى عبر الزمن</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.timeline && profile.timeline.length > 0 ? (
                <div className="space-y-4">
                  {profile.timeline.map((timeline, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-primary rounded-full p-2 mt-1">
                        <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                      </div>
                      <div className="flex-1 pb-4 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <ComplaintStatusBadge status={timeline.status} />
                          <span className="text-muted-foreground text-sm">
                            {format(timeline.timestamp, "PPPPp", { locale: ar })}
                          </span>
                        </div>
                        {timeline.notes && <p className="text-muted-foreground mt-1">{timeline.notes}</p>}
                        {timeline.actor && (
                          <p className="text-sm text-muted-foreground mt-1">بواسطة: {timeline.actor}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">لا توجد بيانات زمنية</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>التعليقات</CardTitle>
              <CardDescription>المناقشات والملاحظات على هذه الشكوى</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">سيتم إضافة نظام التعليقات قريباً</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
