"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { AppProvider } from "@/lib/AppContext";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/onboarding";

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);


  useEffect(() => {
    // Simple auth check
    const user = localStorage.getItem("user");
    if (!user && !isAuthPage) {
      router.push("/login");
    }
  }, [pathname, isAuthPage, router]);

  if (isAuthPage) {
    return (
      <AppProvider>
        <main className="w-full h-screen bg-surface-container-lowest overflow-y-auto">
          {children}
        </main>
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <Sidebar mobileOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onMenuClick={openSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </AppProvider>
  );
}
