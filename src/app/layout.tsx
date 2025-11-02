import { Providers } from "@/components/providers/providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>{children}</Providers>
          <Toaster richColors theme="light" position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
// /* <AppProvider
//               initialDirection={direction}
//               isFirstVisit={isFirstVisit}
//             >
//             </AppProvider> */
// const headersList = await headers();
// const direction = (headersList.get("x-direction") || "ltr") as "ltr" | "rtl";
// const isFirstVisit = headersList.get("x-is-first-visit") === "true";
