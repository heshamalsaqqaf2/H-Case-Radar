import { redirect } from "next/navigation";
import { HeaderDashboardPage } from "@/components/admin/header-dashboard-page";
import { getCurrentUserId } from "@/lib/authentication/session";
import { getUserProfileAction } from "@/lib/users/actions/user-actions";
import { ProfileForm } from "./components/profile-form";

export default async function ProfilePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");

  const result = await getUserProfileAction();

  if (!result.success || !result.data) {
    return <div>فشل تحميل بيانات الملف الشخصي</div>;
  }

  const user = result.data;

  return (
    <div className="space-y-6 px-5">
      <HeaderDashboardPage
        title="الملف الشخصي"
        description="إدارة معلوماتك الشخصية"
      />

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-medium">المعلومات الأساسية</h3>
          <p className="text-sm text-muted-foreground">
            قم بتحديث اسمك وبريدك الإلكتروني الشخصي.
          </p>
        </div>

        <ProfileForm
          initialData={{
            name: user.name,
            personalEmail: user.personalEmail,
            image: user.image,
          }}
        />
      </div>
    </div>
  );
}
