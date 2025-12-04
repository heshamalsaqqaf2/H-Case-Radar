import { redirect } from "next/navigation";
import { Suspense } from "react";
import { HeroHeader } from "@/app/home/components/custom/header";
import FooterSection from "@/app/home/components/layout/footer-2";
import { StatsCards } from "@/components/dashboard/widgets/stats-cards";
import { LoadingState } from "@/components/shared/loading-state";
import { getCurrentUserId } from "@/lib/authentication/session";
import { getUserAssignedComplaintsAction } from "@/lib/complaints/actions/user-complaints-actions";
import { UserComplaintsList } from "./components/user-complaints-list";

export default async function UserDashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");

  // Prefetch data on server
  await getUserAssignedComplaintsAction();

  return (
    <main className="overflow-hidden">
      <div className="space-y-6">
        <HeroHeader />
        <StatsCards />
        <Suspense fallback={<LoadingState />}>
          <UserComplaintsList />
        </Suspense>
        <FooterSection />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-linear-to-t from-green-500/30 via-emerald-600/10 dark:from-emerald-500/30 dark:via-teal-600/10 via-30% to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-linear-to-t from-blue-500/20 via-emerald-500/10 dark:from-cyan-500/20 dark:via-emerald-500/10 to-transparent blur-3xl" />
      </div>
    </main>
  );
}
