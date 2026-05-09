"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/agents", label: "Agents", icon: "smart_toy" },
  { href: "/customers", label: "Müşteriler", icon: "forum" },
  { href: "/inventory", label: "Envanter", icon: "inventory_2" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

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
        <button className="w-full bg-secondary text-on-secondary text-xs font-semibold tracking-wider uppercase py-3 rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-sm active:scale-[0.98]">
          <span className="material-symbols-outlined text-sm">route</span>
          Rota Optimize Et
        </button>
        <hr className="border-outline-variant" />
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all text-sm"
        >
          <span className="material-symbols-outlined text-outline">help</span>
          Yardım
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all text-sm"
        >
          <span className="material-symbols-outlined text-outline">logout</span>
          Çıkış
        </Link>
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
    </>
  );
}
