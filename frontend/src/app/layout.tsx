import type { Metadata } from "next";
import "./globals.css";
import ShellLayout from "@/components/ShellLayout";

export const metadata: Metadata = {
  title: "SME Orchestrator — AI Operations Platform",
  description: "AI-powered operations management for Turkish SMEs and cooperatives",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-background text-on-surface h-screen overflow-hidden flex">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}
