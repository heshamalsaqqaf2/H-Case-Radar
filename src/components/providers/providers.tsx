"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export function Providers({ children }: Props) {
  // استخدام useState لضمان إنشاء العميل مرة واحدة فقط
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 60 * 1000, // 60 minutes
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
