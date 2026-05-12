"use client";
import { useState, useRef, useEffect } from "react";

import { useState, useRef, useEffect } from "react";

interface TopNavProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function TopNav({ title = "SME AI Command", onMenuClick }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchActive(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };

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
        <div className="relative hidden sm:block" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchActive(true)}
            placeholder="Arama yap..."
            className="pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none w-48 lg:w-64 transition-all"
          />
          {isSearchActive && searchQuery && (
            <div className="absolute top-full mt-2 w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 z-50 animate-fade-in">
              <div className="text-xs text-on-surface-variant p-2">"{searchQuery}" için sonuçlar aranıyor...</div>
              <div className="text-xs text-secondary font-semibold p-2 flex items-center gap-2 hover:bg-surface-container cursor-pointer rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                AI Copilot ile sor
              </div>
            </div>
          )}
        </div>

        {/* Mobile search button */}
        <button 
          onClick={() => {
            const query = prompt("Arama yapın:");
            if (query) alert(`"${query}" araması başlatıldı.`);
          }}
          className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors sm:hidden"
        >
          <span className="material-symbols-outlined text-primary">search</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 md:gap-1 text-primary">
          <button 
            onClick={() => alert("Sistem Durumu: Tüm servisler (Frontend, Backend, AI) sorunsuz çalışıyor.")}
            className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors hidden sm:block"
            title="Sistem Durumu"
          >
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
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-xs font-semibold border border-outline-variant hover:opacity-80 transition-opacity uppercase"
          >
            {user ? user.name.substring(0, 2) : "AB"}
          </button>
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 animate-slide-up overflow-hidden py-1">
              <div className="px-4 py-2 border-b border-outline-variant mb-1">
                <p className="text-sm font-semibold truncate">{user ? user.name : "Kullanıcı"}</p>
                <p className="text-xs text-on-surface-variant truncate">{user ? user.email : "Giriş yapılmadı"}</p>
              </div>
              <button 
                onClick={() => { setIsProfileOpen(false); window.location.href = "/profile"; }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">person</span> Profilim
              </button>
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span> Hesap Ayarları
              </button>
              <div className="border-t border-outline-variant my-1" />
              <button 
                onClick={() => { 
                  localStorage.removeItem("user"); 
                  window.location.href = "/login";
                }}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span> Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
