"use client";

import { useState, useRef, useEffect } from "react";

interface TopNavProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function TopNav({ title = "SME AI Command", onMenuClick }: TopNavProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-2 w-full z-40 bg-surface-bright border-b border-outline-variant shrink-0">
      {/* Mobile menu + title */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onMenuClick}
          className="p-1.5 -ml-1 hover:bg-surface-container-high rounded-full transition-colors"
          aria-label="Menüyü aç"
        >
          <span className="material-symbols-outlined text-on-surface">menu</span>
        </button>
        <span className="font-headline text-lg font-bold text-primary">{title}</span>
      </div>
      <div className="hidden md:block">
        <h2 className="font-headline text-xl font-semibold text-primary">{title}</h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Arama yap..."
            className="pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none w-48 lg:w-64 transition-all"
          />
        </div>

        {/* Mobile search button */}
        <button className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors sm:hidden">
          <span className="material-symbols-outlined text-primary">search</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 md:gap-1 text-primary">
          <button className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors hidden sm:block">
            <span className="material-symbols-outlined">monitor_heart</span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden animate-slide-up z-50">
                <div className="p-3 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-primary">Bildirimler</h4>
                  <span className="text-xs text-secondary hover:underline cursor-pointer">Tümünü Oku</span>
                </div>
                <div className="flex flex-col max-h-80 overflow-y-auto">
                  <div className="p-3 hover:bg-surface-container-low border-b border-outline-variant/50 cursor-pointer flex gap-3 items-start transition-colors">
                    <div className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Kritik Stok Uyarısı</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Zeytinyağı stokları tükendi. Üretim durabilir.</p>
                      <p className="text-[10px] text-outline mt-1 font-mono">5 dk önce</p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-surface-container-low border-b border-outline-variant/50 cursor-pointer flex gap-3 items-start transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Sipariş Gönderildi</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Ege Zeytincilik'e 100 Lt zeytinyağı siparişi iletildi.</p>
                      <p className="text-[10px] text-outline mt-1 font-mono">15 dk önce</p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-surface-container-low cursor-pointer flex gap-3 items-start transition-colors">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">AI Haftalık Raporu</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Geçen haftanın analizleri ve yeni trend tahminleri.</p>
                      <p className="text-[10px] text-outline mt-1 font-mono">2 saat önce</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-outline-variant bg-surface-bright text-center">
                  <span className="text-xs font-semibold tracking-wider uppercase text-primary hover:underline cursor-pointer">Tümünü Gör</span>
                </div>
              </div>
            )}
          </div>
          <button className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors hidden sm:block">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-xs font-semibold border border-outline-variant">
          AB
        </div>
      </div>
    </header>
  );
}
