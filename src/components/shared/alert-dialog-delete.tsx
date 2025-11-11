"use client";

import { CircleAlertIcon } from "lucide-react";
import { useId, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "../ui/spinner";

interface AlertDialogDeleteProps {
  itemName: string;
  itemType: string;
  onConfirm: () => Promise<void>;
  trigger?: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

export function AlertDialogDelete({
  itemName,
  itemType,
  onConfirm,
  trigger,
  description,
  isLoading = false,
}: AlertDialogDeleteProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const isInputCorrect = inputValue === itemName;
  const isDisabled = !isInputCorrect || isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInputCorrect && !isLoading) {
      onConfirm(); // Not Close Dialog
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            Delete {itemType}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">حذف {itemType} نهائياً</DialogTitle>
            <DialogDescription className="sm:text-center">
              <span className="font-semibold">{itemName}</span>
              {description || `لا يمكن التراجع عن هذا الإجراء. للتأكيد، يرجى كتابة اسم ${itemType}`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="*:not-first:mt-2">
            <Label htmlFor={id}>إسم {itemType}</Label>
            <Input
              id={id}
              type="text"
              placeholder={`إكتب ${itemName} للتحقق`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={(e) => {
                // نغلق الـ Dialog يدويًا فقط إذا لم تكن هناك عملية جارية
                if (!isLoading) {
                  (e.target as HTMLElement)
                    .closest('[data-state="open"]')
                    ?.querySelector("[data-close]")
                    ?.dispatchEvent(new MouseEvent("click"));
                }
              }}
            >
              إلغاء
            </Button>

            <Button
              type="submit"
              variant={isInputCorrect ? "destructive" : "default"}
              className="flex-1"
              disabled={isDisabled}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  جاري الحذف
                </>
              ) : (
                "حذف"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
