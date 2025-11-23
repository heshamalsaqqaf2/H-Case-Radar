import { CreateComplaintDialog } from "../components/create-complaint-dialog";

export default function NewComplaintPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">إنشاء شكوى جديدة</h2>
          <p className="text-muted-foreground">أضف شكوى جديدة إلى نظام إدارة الشكاوى</p>
        </div>
      </div>

      <CreateComplaintDialog
        open={false}
        onOpenChange={(): void => {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}
