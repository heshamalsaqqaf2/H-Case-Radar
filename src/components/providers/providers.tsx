"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";

interface Props {
  children: React.ReactNode;
}

const Providers = ({ children }: Props) => {
  const client = new QueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default Providers;
