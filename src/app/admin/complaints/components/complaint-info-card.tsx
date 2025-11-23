import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
    Activity,
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Flag,
    FolderOpen,
    History,
    Mail,
    Shield,
    Sparkles,
    TrendingUp,
    User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplaintWithUserDetails } from "@/lib/complaints/types/type-complaints";
import { cn } from "@/lib/utils";

const priorityOptions = [
    { value: "low", label: "منخفضة", color: "bg-blue-100 text-blue-800" },
    { value: "medium", label: "متوسطة", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "عالية", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "حرجة", color: "bg-red-100 text-red-800" },
];
const sourceOptions = [
    { value: "web_form", label: "نموذج الويب", icon: "🌐" },
    { value: "email", label: "البريد الإلكتروني", icon: "📧" },
    { value: "phone", label: "الهاتف", icon: "📞" },
    { value: "mobile_app", label: "تطبيق الجوال", icon: "📱" },
    { value: "api", label: "API", icon: "🔌" },
];
const escalationOptions = [
    { value: "none", label: "بدون تصعيد", color: "bg-gray-100 text-gray-800" },
    { value: "level_1", label: "المستوى الأول", color: "bg-blue-100 text-blue-800" },
    { value: "level_2", label: "المستوى الثاني", color: "bg-orange-100 text-orange-800" },
    { value: "level_3", label: "المستوى الثالث", color: "bg-red-100 text-red-800" },
];
const statusOptions = [
    { value: "open", label: "مفتوحة", icon: <Clock className="h-4 w-4" /> },
    { value: "in_progress", label: "قيد التنفيذ", icon: <Activity className="h-4 w-4" /> },
    { value: "resolved", label: "تم الحل", icon: <CheckCircle2 className="h-4 w-4" /> },
    { value: "closed", label: "مغلقة", icon: <Shield className="h-4 w-4" /> },
    { value: "unresolved", label: "لم تحل", icon: <AlertCircle className="h-4 w-4" /> },
    { value: "escalated", label: "مُصعّدة", icon: <AlertCircle className="h-4 w-4" /> },
    { value: "on_hold", label: "معلقة", icon: <Clock className="h-4 w-4" /> },
    { value: "reopened", label: "أُعيد فتحها", icon: <History className="h-4 w-4" /> },
];
interface ComplaintInfoCardProps {
    complaint: ComplaintWithUserDetails;
}

export const ComplaintInfoCard = ({ complaint }: ComplaintInfoCardProps) => {
    const getStatusIcon = (status: string) => {
        const icons = {
            open: <Clock className="h-4 w-4 text-blue-500" />,
            in_progress: <Activity className="h-4 w-4 text-orange-500" />,
            resolved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            closed: <Shield className="h-4 w-4 text-gray-500" />,
            unresolved: <AlertCircle className="h-4 w-4 text-red-500" />,
            escalated: <TrendingUp className="h-4 w-4 text-purple-500" />,
            on_hold: <Clock className="h-4 w-4 text-yellow-500" />,
            reopened: <History className="h-4 w-4 text-indigo-500" />,
        };
        return icons[status as keyof typeof icons] || <FileText className="h-4 w-4" />;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            open: "border-blue-200 bg-blue-50 text-blue-700",
            in_progress: "border-orange-200 bg-orange-50 text-orange-700",
            resolved: "border-green-200 bg-green-50 text-green-700",
            closed: "border-gray-200 bg-gray-50 text-gray-700",
            unresolved: "border-red-200 bg-red-50 text-red-700",
            escalated: "border-purple-200 bg-purple-50 text-purple-700",
            on_hold: "border-yellow-200 bg-yellow-50 text-yellow-700",
            reopened: "border-indigo-200 bg-indigo-50 text-indigo-700",
        };
        return colors[status as keyof typeof colors] || "border-gray-200 bg-gray-50";
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: "bg-blue-100 text-blue-800 border-blue-200",
            medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
            high: "bg-orange-100 text-orange-800 border-orange-200",
            critical: "bg-red-100 text-red-800 border-red-200",
        };
        return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
    };

    return (
        <Card className="sticky top-6 h-fit border-l-4 border-l-primary">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    معلومات الشكوى
                </CardTitle>
                <CardDescription>تفاصيل الشكوى الحالية</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* رقم الشكوى */}
                <div className="flex items-center justify-between p-3 bg-linear-to-r from-primary/5 to-primary/10 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">رقم الشكوى</span>
                    <Badge variant="secondary" className="font-mono">
                        #{complaint.id.slice(0, 8)}...
                    </Badge>
                </div>

                {/* حالة الشكوى */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">الحالة الحالية</span>
                    </div>
                    <div
                        className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border-2",
                            getStatusColor(complaint.status),
                        )}
                    >
                        {getStatusIcon(complaint.status)}
                        <span className="font-semibold capitalize">
                            {statusOptions.find((opt) => opt.value === complaint.status)?.label}
                        </span>
                    </div>
                </div>

                {/* الأولوية */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">مستوى الأولوية</span>
                    </div>
                    <Badge className={cn("w-full justify-center py-2 border-2", getPriorityColor(complaint.priority))}>
                        {priorityOptions.find((opt) => opt.value === complaint.priority)?.label}
                    </Badge>
                </div>

                {/* المعلومات الأساسية */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">المعلومات الأساسية</span>
                    </div>

                    <div className="grid gap-3 text-sm">
                        {/* الفئة */}
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">الفئة:</span>
                            <span className="font-medium">{complaint.category}</span>
                        </div>

                        {/* المصدر */}
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">المصدر:</span>
                            <span className="font-medium">
                                {sourceOptions.find((opt) => opt.value === complaint.source)?.label}
                            </span>
                        </div>

                        {/* مستوى التصعيد */}
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">مستوى التصعيد:</span>
                            <Badge
                                variant="outline"
                                className={escalationOptions.find((opt) => opt.value === complaint.escalationLevel)?.color}
                            >
                                {escalationOptions.find((opt) => opt.value === complaint.escalationLevel)?.label}
                            </Badge>
                        </div>

                        {/* عاجلة */}
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">عاجلة:</span>
                            <Badge variant={complaint.isUrgent ? "destructive" : "outline"}>
                                {complaint.isUrgent ? "نعم" : "لا"}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* التواريخ */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">التواريخ</span>
                    </div>

                    <div className="grid gap-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                            <span className="font-medium">
                                {format(new Date(complaint.createdAt), "dd/MM/yyyy", { locale: ar })}
                            </span>
                        </div>

                        {complaint.responseDueAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">موعد الاستجابة:</span>
                                <span className="font-medium">
                                    {format(new Date(complaint.responseDueAt), "dd/MM/yyyy", { locale: ar })}
                                </span>
                            </div>
                        )}

                        {complaint.expectedResolutionDate && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">الحل المتوقع:</span>
                                <span className="font-medium">
                                    {format(new Date(complaint.expectedResolutionDate), "dd/MM/yyyy", { locale: ar })}
                                </span>
                            </div>
                        )}

                        {complaint.resolvedAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">تم الحل في:</span>
                                <span className="font-medium text-green-600">
                                    {format(new Date(complaint.resolvedAt), "dd/MM/yyyy", { locale: ar })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* المستخدمون */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">المستخدمون</span>
                    </div>

                    <div className="grid gap-3 text-sm">
                        {/* مقدم الشكوى */}
                        <div className="space-y-1">
                            <span className="text-muted-foreground block">مقدم الشكوى:</span>
                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                <User className="h-3 w-3" />
                                <span className="font-medium">{complaint.submittedByUserName}</span>
                            </div>
                        </div>

                        {/* المستخدم المعين */}
                        {complaint.assignedTo && (
                            <div className="space-y-1">
                                <span className="text-muted-foreground block">المُعيّن إليه:</span>
                                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded border border-primary/20">
                                    <Mail className="h-3 w-3 text-primary" />
                                    <span className="font-medium text-primary">{complaint.assignedUserName}</span>
                                </div>
                            </div>
                        )}

                        {/* تم الحل بواسطة */}
                        {complaint.resolvedBy && (
                            <div className="space-y-1">
                                <span className="text-muted-foreground block">تم الحل بواسطة:</span>
                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    <span className="font-medium text-green-700">{complaint.resolvedBy}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* الإحصائيات */}
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">الإحصائيات</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{complaint.tags?.length || 0}</div>
                            <div className="text-xs text-blue-500">الوسوم</div>
                        </div>

                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-600">{complaint.attachments?.length || 0}</div>
                            <div className="text-xs text-green-500">المرفقات</div>
                        </div>

                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-2xl font-bold text-orange-600">{complaint.reopenCount || 0}</div>
                            <div className="text-xs text-orange-500">مرات إعادة الفتح</div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">
                                {complaint.actualResolutionTime ? `${complaint.actualResolutionTime}س` : "-"}
                            </div>
                            <div className="text-xs text-purple-500">وقت الحل</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
