import { headers } from "next/headers";
import { AppProvider } from "@/components/providers/app-provider";
import { Providers } from "@/components/providers/providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const direction = (headersList.get("x-direction") || "ltr") as "ltr" | "rtl";
  const isFirstVisit = headersList.get("x-is-first-visit") === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <AppProvider
              initialDirection={direction}
              isFirstVisit={isFirstVisit}
            >
              {children}
            </AppProvider>
          </Providers>
          <Toaster richColors theme="light" position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
