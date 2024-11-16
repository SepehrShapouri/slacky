"use client";
import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JotaiProvider } from "./jotai-provider";
import { SidebarProvider } from "../ui/sidebar";

function Providers({ children }: React.PropsWithChildren) {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <JotaiProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}

export default Providers;
