import { AlertTriangle } from "lucide-react";
import { SeedPanel } from "@/components/admin/seed/seed-panel";
import { ProtectedComponent } from "@/components/auth/protected-component";

export default function SeedPage() {
  return (
    <ProtectedComponent permission="permission.create">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Database Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Initialize and manage database roles and permissions
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700">لوحة الإدارة</span>
          </div>
        </div>
        <SeedPanel />
        <div className="max-w-4xl mx-auto text-sm text-muted-foreground">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">ملاحظات مهمة: :</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>سيؤدي الإرسال إلى إنشاء أدوار وأذونات افتراضية</li>
              <li>سيؤدي المسح إلى إزالة جميع بيانات الأدوار والأذونات</li>
              <li>
                إعادة التهيئة ستؤدي إلى مسح البيانات الموجودة وإنشاء إعدادات
                افتراضية جديدة
              </li>
              <li>يتطلب هذا الإجراء أذونات مناسبة</li>
              <li>
                قم دائمًا بعمل نسخة احتياطية من قاعدة البيانات قبل تنفيذ هذه
                الإجراءات
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedComponent>
  );
}
