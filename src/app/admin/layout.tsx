// src/app/(admin)/layout.tsx

import { APIError } from "better-auth";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "./_components/layout/admin-header";
import { AdminSidebar } from "./_components/layout/admin-sidebar";
import { getVisibleNavItems } from "./actions/sidebar-actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let visibleNavItems: Awaited<ReturnType<typeof getVisibleNavItems>>;
  try {
    visibleNavItems = await getVisibleNavItems();
  } catch (error) {
    if (error instanceof APIError && error.status === 401) {
      redirect("/sign-in");
    }
    throw error;
  }

  if (visibleNavItems.length === 0) {
    redirect("/unauthorized");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AdminSidebar items={visibleNavItems} />
        <div className="flex flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

// import { AdminHeader } from "@/app/admin/_components/layout/admin-header";
// import { ProtectedComponent } from "@/components/auth/protected-component";
// import { AdminSidebar } from "./_components/layout/admin-sidebar";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ProtectedComponent permission="admin.dashboard.view">
//       <div className="min-h-screen">
//         <AdminHeader />
//         <div className="flex">
//           <AdminSidebar />
//           <main className="flex-1 p-6">{children}</main>
//         </div>
//       </div>
//     </ProtectedComponent>
//   );
// }
