import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Providers from "@/components/providers/providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
// import { autoSeedIfNeeded } from "@/lib/seed/auto-seed";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // في بيئة التطوير، يمكن تشغيل التهيئة التلقائية
  // if (process.env.NODE_ENV === "development") {
  //   await autoSeedIfNeeded();
  // }
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="light" defaultTheme="dark" enableSystem>
          <Providers>
            <Toaster richColors theme="light" position="bottom-right" />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
