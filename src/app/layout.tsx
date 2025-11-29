import "./globals.css";
import localFont from "next/font/local";

import { redirect } from "next/navigation";
import { Providers } from "@/components/providers/providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/lib/authentication/session";

const myFont = localFont({
  src: "../../public/fonts/Almarai-Regular.woff",
  display: "swap",
});

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactElement;
  params: { locale: string };
}>) {

  const userSession = getCurrentUser();
  if (!userSession) redirect("/sign-in");

  return (
    <html lang={locale} dir={locale === "fa" ? "ltr" : "rtl"} suppressHydrationWarning>
      <body className={myFont.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>{children}</Providers>
          <Toaster richColors theme="system" position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}