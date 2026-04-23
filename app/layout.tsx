import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], display: "swap", preload: false });

export const metadata: Metadata = {
  title: "SuperLabs Products",
  description: "Product listing platform built by Eswaran for SuperLabs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen bg-background`}
      >
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
