"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const navItems = [
  { href: "/", label: "Ana Sayfa", icon: "dashboard" },
  { href: "/agents", label: "Agents", icon: "smart_toy" },
  { href: "/customers", label: "Müşteriler", icon: "forum" },
  { href: "/inventory", label: "Envanter", icon: "inventory_2" },
  { href: "/orders", label: "Siparişler", icon: "local_shipping" },
  { href: "/settings", label: "Ayarlar", icon: "settings" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    onClose?.();
  }, [pathname, onClose]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-lg">hub</span>
        </div>
        <h1 className="font-headline text-xl font-bold text-primary">
          SME Orchestrator
        </h1>
      </div>

      {/* Navigation */}
      <ul className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${isActive ? "fill-icon" : ""}`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* CTA */}
      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all text-sm"
        >
          <span className="material-symbols-outlined text-outline">help</span>
          Yardım
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all text-sm"
        >
          <span className="material-symbols-outlined text-error">logout</span>
          Çıkış
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col h-screen py-6 px-4 border-r border-outline-variant bg-surface-container w-64 shrink-0 z-40">
        {sidebarContent}
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Drawer */}
        <nav
          className={`absolute top-0 left-0 h-full w-72 bg-surface-container py-6 px-4 flex flex-col shadow-xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-surface-container-high rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
          {sidebarContent}
        </nav>
      </div>

      {/* Help Modal */}
      {mounted && typeof document !== "undefined" && createPortal(
        isHelpOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
              <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="font-headline font-semibold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">help</span>
                  Yardım ve Destek
                </h3>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <p className="text-sm text-on-surface-variant">SME Orchestrator sistemini kullanırken desteğe ihtiyacınız olursa bizimle iletişime geçebilirsiniz.</p>
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-outline text-[18px]">mail</span>
                    <span>destek@sme-orchestrator.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-outline text-[18px]">phone</span>
                    <span>0850 123 45 67</span>
                  </div>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="w-full py-2 bg-secondary text-on-secondary rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                  Kapat
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </>
  );
}
