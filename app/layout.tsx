import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ContextOS",
  description: "AI-Native Memory OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} antialiased`} style={{ colorScheme: "dark" }}>
      <body className="font-sans bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-primary overflow-x-hidden">
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
