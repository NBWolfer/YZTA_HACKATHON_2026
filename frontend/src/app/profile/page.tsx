"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null; // or loading spinner

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            Profilim
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm md:text-base">
            Hesap bilgilerinizi ve ayarlarınızı yönetin.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden micro-shadow animate-slide-up">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary to-secondary opacity-90 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-surface-container-lowest border-4 border-surface-container-lowest flex items-center justify-center text-3xl font-bold text-primary shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold font-headline">{user.name}</h2>
              <p className="text-on-surface-variant text-sm">{user.email}</p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-lg text-sm font-semibold transition-colors"
            >
              {isEditing ? "İptal" : "Düzenle"}
            </button>
          </div>

          {isEditing ? (
            <form className="mt-8 flex flex-col gap-4 max-w-md" onSubmit={(e) => { e.preventDefault(); setIsEditing(false); }}>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Ad Soyad</label>
                <input 
                  type="text" 
                  defaultValue={user.name}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">E-posta</label>
                <input 
                  type="email" 
                  defaultValue={user.email}
                  disabled
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface-variant opacity-70 cursor-not-allowed"
                />
                <p className="text-xs text-outline mt-1">E-posta adresi değiştirilemez.</p>
              </div>
              <button type="submit" className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity w-fit">
                Kaydet
              </button>
            </form>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-secondary text-[20px]">badge</span>
                  <h3 className="font-semibold text-sm">Rol</h3>
                </div>
                <p className="text-on-surface-variant text-sm pl-7">Yönetici (Admin)</p>
              </div>
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
                  <h3 className="font-semibold text-sm">Son Giriş</h3>
                </div>
                <p className="text-on-surface-variant text-sm pl-7">Şimdi</p>
              </div>
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-outline-variant">
            <h3 className="font-semibold text-error mb-4">Tehlikeli Alan</h3>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-error-container text-on-error-container hover:opacity-90 rounded-lg text-sm font-semibold transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Oturumu Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
