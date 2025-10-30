"use client";

import { Loader2, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authentication/auth-client";
import { useCurrentUser } from "@/lib/authorization/hooks/use-auth";
import { AnimatedThemeToggler } from "../ui/magic-ui/animated-theme-toggler";

export function AdminNavbar() {
  const { data: user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const displayUser = {
        Id: user?.id.slice(0, 6),
        Name: user?.name,
        Email: user?.email,
        Data:
          new Date().getDate() +
          "/" +
          new Date().getUTCMonth() +
          "/" +
          new Date().getFullYear(),
      };
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully logged out", {
              description: (
                <pre>
                  <code>{JSON.stringify(displayUser, null, 2)}</code>
                </pre>
              ),
            });
            setTimeout(() => {
              router.push("/sign-in");
            }, 3000);
          },
          onError: (ctx) => {
            toast.error("خطأ لم يتم تسجيل الخروج", {
              description: (
                <div>
                  <p>انتهت الجلسة, يرجى تسجيل الدخول.</p>
                  <span>{ctx.error.message}</span>
                </div>
              ),
            });
          },
        },
      });
    } catch (error) {
      toast.error("حدث خطأ غير متوقع", {
        description: `${error} | UNKNOWN ERROR.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">لوحة تحكم الأدمن</h1>
        </div>

        <AnimatedThemeToggler />
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4" />
            <span>{user?.name}</span>
            <span className=""> - {user?.email}</span>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            الإعدادات
          </Button>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "تسجيل الخروج"
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
