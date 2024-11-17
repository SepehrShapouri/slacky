import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/providers";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { Modals } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "@/app/api/uploadthing/core";

import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({ subsets: ["cyrillic"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
export const viewport:Viewport = {
  maximumScale:1,
  userScalable:false
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Modals />
          <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
