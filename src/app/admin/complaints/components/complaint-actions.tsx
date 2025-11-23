// components/complaints/complaint-button-actions.tsx
"use client";

import { CheckCircle, Edit, RotateCcw, Trash2, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCloseComplaint,
  useDeleteComplaint,
  useEscalateComplaint,
  useReopenComplaint,
  useResolveComplaint,
  useupdateEscalationComplaintLevel,
} from "@/lib/complaints/hooks/use-complaints";
import { ComplaintStatus } from "@/lib/complaints/state/complaint-status";
import type {
  ComplaintEscalationLevelType,
  ComplaintWithUserDetails,
} from "@/lib/complaints/types/type-complaints";
import { cn } from "@/lib/utils";

interface ComplaintActionsProps {
  complaint: ComplaintWithUserDetails;
}

export function ComplaintActions({ complaint }: ComplaintActionsProps) {
  // Dialog States
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);

  // Dialog Inputs
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [escalationLevel, setEscalationLevel] = useState<ComplaintEscalationLevelType>(
    complaint.escalationLevel,
  );

  // Complaint Mutations Hooks
  const resolveComplaintMutation = useResolveComplaint();
  const closeComplaintMutation = useCloseComplaint();
  const reopenComplaintMutation = useReopenComplaint();
  const deleteComplaintMutation = useDeleteComplaint();
  const escalateComplaintMutation = useEscalateComplaint();

  // Update Escalation Level Dialog
  const [escalationUpdateLevelDialogOpen, setEscalationUpdateLevelDialogOpen] = useState(false);
  // Update Escalation Level Hooks
  const updateEscalationComplaintLevelMutation = useupdateEscalationComplaintLevel();

  const handleResolve = () => {
    resolveComplaintMutation.mutate({
      complaintId: complaint.id,
      resolutionNotes,
    });
    setResolveDialogOpen(false);
    setResolutionNotes("");
  };

  const handleClose = () => {
    closeComplaintMutation.mutate({ complaintId: complaint.id });
  };

  const handleReopen = () => {
    reopenComplaintMutation.mutate({
      complaintId: complaint.id,
      reason: reopenReason,
    });
    setReopenDialogOpen(false);
    setReopenReason("");
  };

  const handleDelete = () => {
    deleteComplaintMutation.mutate({ id: complaint.id });
    setDeleteDialogOpen(false);
  };

  const handleEscalate = () => {
    escalateComplaintMutation.mutate({
      complaintId: complaint.id,
      level: escalationLevel,
    });
    setEscalateDialogOpen(false);
  };

  // ✅ دالة جديدة لتعديل المستوى (بمنطق مختلف)
  const handleUpdateLevel = () => {
    updateEscalationComplaintLevelMutation.mutate({
      complaintId: complaint.id,
      level: escalationLevel,
    });
    setEscalationUpdateLevelDialogOpen(false);
  };

  useEffect(() => {
    if (escalateDialogOpen) {
      setEscalationLevel(complaint.escalationLevel);
    }
  }, [escalateDialogOpen, complaint.escalationLevel]);

  const escalationOptions: { value: ComplaintEscalationLevelType; label: string }[] = [
    { value: "level_1", label: "المستوى الأول" },
    { value: "level_2", label: "المستوى الثاني" },
    { value: "level_3", label: "المستوى الثالث" },
  ];

  const currentLevelIndex = escalationOptions.findIndex((opt) => opt.value === complaint.escalationLevel);

  return (
    <div className="space-y-2">


      {complaint.status !== "resolved" && complaint.status !== "closed" && (
        <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              حل الشكوى
              {/*  userMessage: 'حدث خطأ غير متوقع، يرجى المحاولة لاحقًا', */}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حل الشكوى</DialogTitle>
              <DialogDescription>أدخل ملاحظات الحل لهذه الشكوى</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resolution-notes">ملاحظات الحل</Label>
                <Textarea
                  id="resolution-notes"
                  placeholder="أدخل ملاحظات الحل..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResolveDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="button" onClick={handleResolve}>
                حل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {complaint.status !== ComplaintStatus.CLOSED && complaint.status !== ComplaintStatus.RESOLVED && (
        <Button variant="outline" className="w-full justify-start" onClick={handleClose}>
          <XCircle className="mr-2 h-4 w-4" />
          إغلاق الشكوى
        </Button>
      )}

      {(complaint.status === ComplaintStatus.CLOSED || complaint.status === ComplaintStatus.RESOLVED) && (
        <Dialog open={reopenDialogOpen} onOpenChange={setReopenDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <RotateCcw className="mr-2 h-4 w-4" />
              إعادة فتح الشكوى
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إعادة فتح الشكوى</DialogTitle>
              <DialogDescription>أدخل سبب إعادة فتح هذه الشكوى</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reopen-reason">السبب</Label>
                <Textarea
                  id="reopen-reason"
                  placeholder="أدخل سبب إعادة الفتح..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReopenDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="button" onClick={handleReopen}>
                إعادة فتح
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {(complaint.status !== ComplaintStatus.CLOSED && complaint.status !== ComplaintStatus.RESOLVED) && (
        <>
          <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                تصعيد الشكوى
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تصعيد الشكوى</DialogTitle>
                {/* ✅ تحسين الوصف ليكون أوضح للمستخدم */}
                <DialogDescription>
                  اختر مستوى تصعيد أعلى من المستوى الحالي. المستوى الحالي:{" "}
                  <strong>
                    {escalationOptions.find((opt) => opt.value === complaint.escalationLevel)?.label}
                  </strong>
                  .
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>مستوى التصعيد</Label>
                  <div className="space-y-2">
                    {escalationOptions.map((option, index) => {
                      // ✅ تعطيل الخيارات التي هي بنفس المستوى أو أقل من المستوى الحالي
                      const isDisabled = index <= currentLevelIndex;

                      return (
                        <div key={option.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={option.value}
                            name="escalation-level"
                            value={option.value}
                            // ✅ تعطيل الإدخال إذا كان الخيار غير صالح
                            disabled={isDisabled}
                            checked={escalationLevel === option.value}
                            onChange={(e) => setEscalationLevel(e.target.value as ComplaintEscalationLevelType)} />
                          <Label
                            htmlFor={option.value}
                            // ✅ إضافة أنماط بصرية للإشارة إلى أن الخيار معطل
                            className={cn(
                              "cursor-pointer",
                              isDisabled && "text-muted-foreground cursor-not-allowed"
                            )}
                          >
                            {option.label}
                            {isDisabled && index === currentLevelIndex && " (الحالي)"}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEscalateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={handleEscalate}
                  // ✅ تعطيل الزر إذا كان المستوى المختار هو نفسه الحالي أو أقل
                  disabled={escalationOptions.findIndex((opt) => opt.value === escalationLevel) <= currentLevelIndex}
                >
                  تصعيد
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={escalationUpdateLevelDialogOpen} onOpenChange={setEscalationUpdateLevelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" />
                تعديل مستوى التصعيد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل مستوى التصعيد</DialogTitle>
                <DialogDescription>
                  يمكنك تعديل مستوى التصعيد لأي مستوى متاح. المستوى الحالي:{" "}
                  <strong>
                    {escalationOptions.find((opt) => opt.value === complaint.escalationLevel)?.label}
                  </strong>
                  .
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>مستوى التصعيد الجديد</Label>
                  <div className="space-y-2">
                    {escalationOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`update-${option.value}`}
                          name="update-escalation-level"
                          value={option.value}
                          checked={escalationLevel === option.value}
                          onChange={(e) => setEscalationLevel(e.target.value as ComplaintEscalationLevelType)} />
                        <Label htmlFor={`update-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEscalationUpdateLevelDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateLevel}
                  disabled={escalationLevel === complaint.escalationLevel}
                >
                  حفظ التعديل
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            حذف الشكوى
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الشكوى</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد حذف هذه الشكوى؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
