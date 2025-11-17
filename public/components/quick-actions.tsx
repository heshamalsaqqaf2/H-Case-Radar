"use client";

import { ArrowUp, CheckCircle, MoreHorizontal, RefreshCw, User, XCircle } from "lucide-react";
import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAssignComplaint,
  useCloseComplaint,
  useEscalateComplaint,
  useReopenComplaint,
  useResolveComplaint,
} from "@/lib/complaints/hooks/use-complaints";

interface QuickActionsProps {
  complaintId: string;
  currentStatus: string;
  currentAssignedTo: string;
}

export function QuickActions({ complaintId, currentStatus, currentAssignedTo }: QuickActionsProps) {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [assignTo, setAssignTo] = useState(currentAssignedTo);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [reopenReason, setReopenReason] = useState("");

  const assignComplaint = useAssignComplaint();
  const resolveComplaint = useResolveComplaint();
  const closeComplaint = useCloseComplaint();
  const reopenComplaint = useReopenComplaint();
  const escalateComplaint = useEscalateComplaint();

  const handleAssign = async () => {
    await assignComplaint.mutateAsync({
      complaintId,
      assignedTo: assignTo,
    });
    setIsAssignOpen(false);
  };

  const handleResolve = async () => {
    await resolveComplaint.mutateAsync({
      complaintId,
      resolutionNotes,
    });
    setIsResolveOpen(false);
    setResolutionNotes("");
  };

  const handleReopen = async () => {
    await reopenComplaint.mutateAsync({
      complaintId,
      reason: reopenReason,
    });
    setIsReopenOpen(false);
    setReopenReason("");
  };

  const handleClose = async () => {
    await closeComplaint.mutateAsync({ complaintId });
  };

  const handleEscalate = async (level: string) => {
    await escalateComplaint.mutateAsync({
      complaintId,
      level,
    });
  };

  const users = [
    { value: "user1", label: "أحمد محمد" },
    { value: "user2", label: "فاطمة علي" },
    { value: "user3", label: "خالد إبراهيم" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          الإجراءات
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>الإجراءات السريعة</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Assign */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <User className="h-4 w-4 ml-2" />
              إعادة التعيين
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إعادة تعيين الشكوى</DialogTitle>
              <DialogDescription>قم بتعيين هذه الشكوى إلى مسؤول آخر</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignTo">تعيين إلى</Label>
                <select
                  id="assignTo"
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {users.map((user) => (
                    <option key={user.value} value={user.value}>
                      {user.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAssign}>تعيين</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resolve */}
        {currentStatus !== "resolved" && currentStatus !== "closed" && (
          <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <CheckCircle className="h-4 w-4 ml-2" />
                تم الحل
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>حل الشكوى</DialogTitle>
                <DialogDescription>قم بإضافة ملاحظات حول كيفية حل المشكلة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resolutionNotes">ملاحظات الحل</Label>
                  <Textarea
                    id="resolutionNotes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="اشرح كيف تم حل المشكلة..."
                    className="min-h-32"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResolveOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleResolve}>تأكيد الحل</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Close */}
        {currentStatus !== "closed" && (
          <DropdownMenuItem onClick={handleClose}>
            <XCircle className="h-4 w-4 ml-2" />
            إغلاق الشكوى
          </DropdownMenuItem>
        )}

        {/* Reopen */}
        {(currentStatus === "closed" || currentStatus === "resolved") && (
          <Dialog open={isReopenOpen} onOpenChange={setIsReopenOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة فتح
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إعادة فتح الشكوى</DialogTitle>
                <DialogDescription>اذكر سبب إعادة فتح هذه الشكوى</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reopenReason">سبب إعادة الفتح</Label>
                  <Textarea
                    id="reopenReason"
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="ما هو سبب إعادة فتح الشكوى؟"
                    className="min-h-24"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReopenOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleReopen}>تأكيد إعادة الفتح</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Escalate */}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>التصعيد</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleEscalate("level_1")}>
          <ArrowUp className="h-4 w-4 ml-2" />
          تصعيد للمستوى الأول
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEscalate("level_2")}>
          <ArrowUp className="h-4 w-4 ml-2" />
          تصعيد للمستوى الثاني
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEscalate("level_3")}>
          <ArrowUp className="h-4 w-4 ml-2" />
          تصعيد للمستوى الثالث
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
