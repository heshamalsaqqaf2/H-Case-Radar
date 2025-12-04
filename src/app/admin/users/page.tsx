// app/admin/users/page.tsx
import { getUsersWithRolesAction } from "@/lib/authorization/actions/admin/user-actions";
import { LuxuryStatisticsCards } from "../components/ui/GetBoundingClientRectDemo";
import { UsersList } from "./components/users-list";

export default async function UsersPage() {
  // ✅ جلب البيانات في الخادم
  const usersResult = await getUsersWithRolesAction();
  const initialUsers = usersResult.success ? usersResult.data : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* <LuxuryStatisticsCards /> */}
      <UsersList initialUsers={initialUsers} />
    </div>
  );
}
