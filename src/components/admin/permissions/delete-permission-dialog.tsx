"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeletePermission } from "@/lib/authorization/hooks/admin/use-permissions";

interface DeletePermissionDialogProps {
  permissionId: string;
  permissionName: string;
  onSuccess?: () => void;
}

export function DeletePermissionDialog({
  permissionId,
  permissionName,
  onSuccess,
}: DeletePermissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const deletePermissionMutation = useDeletePermission();

  const handleDelete = async () => {
    const result = await deletePermissionMutation.mutateAsync(permissionId);
    if (result.success) {
      toast.success(result.message);
      setOpen(true);
      onSuccess?.();
    } else {
      toast.error("Error", { description: result.message });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. To confirm, please type the
              permission name{" "}
              <b className="font-mono font-bold text-red-600">
                {permissionName}
              </b>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="confirm-delete">Permission Name</Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${permissionName}" to confirm`}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePermissionMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                confirmText !== permissionName ||
                deletePermissionMutation.isPending
              }
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {deletePermissionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
