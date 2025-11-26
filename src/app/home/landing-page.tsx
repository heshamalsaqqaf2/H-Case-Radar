import Link from "next/link";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center md:gap-12 md:py-16 md:px-20">
      <Link href="/sign-in">Login</Link>
      <Link href="/dashboard">Dashboard Users</Link>
      <Link href="/admin/dashboard">Admin Dashboard</Link>
      <Link href="/admin/users">Admin Users</Link>
      <Link href="/admin/roles">Admin Roles</Link>
    </div>
  );
}
