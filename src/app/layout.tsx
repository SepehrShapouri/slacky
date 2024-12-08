import { fileRouter } from "@/app/api/uploadthing/core";
import { Modals } from "@/components/modals";
import Providers from "@/components/providers/providers";
import { Toaster } from "@/components/ui/sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";
import "./globals.css";

import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({ subsets: ["cyrillic"] });

export const metadata: Metadata = {
  title: "Workify",
  description: "Easy, simple, and clean workspace manager.",
};
export const viewport: Viewport = {
  maximumScale: 1,
  initialScale: 1,
  userScalable: false,
  width: "device-width",
};
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
