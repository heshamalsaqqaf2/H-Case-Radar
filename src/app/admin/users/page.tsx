// app/admin/users/page.tsx

import { UsersList } from "./components/users-list";

export default function UsersPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <UsersList />
    </div>
  );
}
