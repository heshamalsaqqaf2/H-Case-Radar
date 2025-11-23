// components/complaints/assign-complaint-dialog.tsx
"use client";

import { PlusIcon } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAssignableUsers, useAssignComplaint } from "@/lib/complaints/hooks/use-complaints";
import type { ComplaintWithUserDetails } from "@/lib/complaints/types/type-complaints";

interface AssignComplaintDialogProps {
    complaint: ComplaintWithUserDetails;
}

export function AssignComplaintDialog({ complaint }: AssignComplaintDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");

    const assignComplaintMutation = useAssignComplaint();
    const { data: assignableUsers, isLoading, error } = useAssignableUsers();
    const users = assignableUsers?.success ? assignableUsers.data : [];

    const handleAssign = () => {
        if (!selectedUserId) return;
        assignComplaintMutation.mutate({
            complaintId: complaint.id,
            assignedTo: selectedUserId,
        });
        setOpen(false);
        setSelectedUserId("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusIcon />
                    تعيين مستخدم
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>تعيين البلاغ</DialogTitle>
                    <DialogDescription>
                        اختر مستخدم لتعيين هذا البلاغ له. سيتم تغيير حالة البلاغ إلى<br />
                        <span className="text-orange-400 font-medium pl-1 underline">قيد المعالجة </span>
                        وسيتم تعيين المستخدم المحدد.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="assign-user">المستخدم المعين له</Label>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Spinner />
                                <span className="mr-2">جاري تحميل المستخدمين</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-500">خطأ في تحميل قائمة المستخدمين</div>
                        ) : (
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="اختر المستخدم المعين له" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                    {users?.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        إلغاء
                    </Button>
                    <Button type="button" onClick={handleAssign} disabled={!selectedUserId || isLoading}>
                        تعيين
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
