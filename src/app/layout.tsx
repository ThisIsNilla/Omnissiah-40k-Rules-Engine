import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omnissiah | 40k Tactical Rules Engine",
  description: "Static RAG for Warhammer 40k 11th Edition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden">
              <AppSidebar />
              <main className="flex-1 flex flex-col min-w-0 relative">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
