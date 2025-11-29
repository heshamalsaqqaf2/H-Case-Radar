// app/(auth)/sign-in/sign-in-form.tsx
"use client";

import { IconWorld } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSignIn } from "@/lib/authentication/hooks/use-auth";

interface SignInFormProps {
  callbackUrl: string;
}

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signInMutation = useSignIn();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await signInMutation.mutateAsync(formData);

      if (result.success) {
        // بعد تسجيل الدخول، قم بتحديث الصفحة لتحقق من الحالة الجديدة
        // أو قم بإعادة التوجيه ل	reload الصفحة
        router.refresh(); // لتحديث الحالة
        // أو يمكنك استخدام router.push(callbackUrl) لاحقًا بعد التحقق
      }
    } catch (error) {
      console.error("Error during sign in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05),transparent_70%)]" />
      </div>

      <main className="scifi-card p-8 rounded-xl shadow-2xl max-w-md w-full relative z-10 border border-primary/20 bg-card/30">
        <div className="space-y-8">
          <div className="text-center flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,242,255,0.5)] border border-primary/50 mb-4 animate-pulse-slow">
              <IconWorld className="size-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
              تسجيل الدخول
            </h2>
            <p className="text-sm text-muted-foreground mt-2">مرحباً بك في نظام H-Case Radar</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-3 py-2 border border-primary/20 bg-[#050b14]/50 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all placeholder:text-slate-600 hover:border-primary/40"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full px-3 py-2 border border-primary/20 bg-[#050b14]/50 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all placeholder:text-slate-600 hover:border-primary/40"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 text-sm font-bold rounded-md bg-primary text-black hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:shadow-[0_0_25px_rgba(0,242,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    جاري التحقق
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
