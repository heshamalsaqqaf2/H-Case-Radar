"use client";

import { Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        return URL.createObjectURL(file);
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05),transparent_70%)]" />
      </div>

      <Card className="scifi-card w-full max-w-md border-primary/20 p-0 shadow-2xl z-10 bg-card/30 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
            إنشاء حساب جديد
          </CardTitle>
          <CardDescription className="text-slate-400">
            أدخل بياناتك للانضمام إلى النظام
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-300">الاسم</Label>
            <Input
              id="name"
              placeholder="الاسم الكامل"
              required
              className="border-primary/20 bg-[#050b14]/50 text-white focus:ring-primary focus:border-primary placeholder:text-slate-600"
              onChange={(e) => {
                setName(e.target.value);
              }}
              value={name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-300">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="border-primary/20 bg-[#050b14]/50 text-white focus:ring-primary focus:border-primary placeholder:text-slate-600"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-300">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              className="border-primary/20 bg-[#050b14]/50 text-white focus:ring-primary focus:border-primary placeholder:text-slate-600"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password_confirmation" className="text-slate-300">تأكيد كلمة المرور</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              className="border-primary/20 bg-[#050b14]/50 text-white focus:ring-primary focus:border-primary placeholder:text-slate-600"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image" className="text-slate-300">الصورة الشخصية (اختياري)</Label>
            <div className="flex items-end gap-4">
              {imagePreview && (
                <div className="relative w-16 h-16 rounded-md overflow-hidden border border-primary/30">
                  <Image
                    width={100}
                    height={100}
                    src={imagePreview}
                    alt="Profile preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border-primary/20 bg-[#050b14]/50 text-slate-300 file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:mr-4 file:px-2 file:py-1 hover:file:bg-primary/20"
                />
                {imagePreview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full mt-4 font-bold bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:shadow-[0_0_25px_rgba(0,242,255,0.5)] transition-all"
            disabled={loading}
            onClick={async () => {
              startTransition(async () => {
                // await authClient.signUp.email({
                //   email,
                //   password,
                //   name,
                //   image: image ? await convertImageToBase64(image) : "",
                //   callbackURL: "/admin",
                //   fetchOptions: {
                //     onError: (ctx) => {
                //       toast.error("خطأ في إنشاء الحساب", {
                //         description: ctx.error.message,
                //       });
                //     },
                //     onSuccess: async () => {
                //       toast.success("تم إنشاء الحساب بنجاح");
                //       router.push("/admin");
                //     },
                //   },
                // });
              });
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : "إنشاء الحساب"}
          </Button>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center w-full border-t border-primary/10 pt-4">
            <p className="text-center text-xs text-slate-500">
              لديك حساب بالفعل؟{" "}
              <Link href="/sign-in" className="text-primary hover:underline font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
