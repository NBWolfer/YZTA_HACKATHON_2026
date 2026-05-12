"use client";

export default function SettingsPage() {
  return (
    <div className="max-w-[1000px] mx-auto flex flex-col gap-6 md:gap-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">Ayarlar</h1>
        <p className="text-on-surface-variant mt-1 text-sm md:text-base">
          Sistem tercihleri, bildirimler ve profil bilgilerinizi yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Navigation Mockup */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container font-semibold transition-colors text-left w-full">
            <span className="material-symbols-outlined fill-icon">person</span>
            Hesap Bilgileri
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors text-left w-full">
            <span className="material-symbols-outlined">notifications</span>
            Bildirimler
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors text-left w-full">
            <span className="material-symbols-outlined">palette</span>
            Görünüm
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors text-left w-full">
            <span className="material-symbols-outlined">security</span>
            Güvenlik
          </button>
        </div>

        {/* Content Area Mockup */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Profile Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 micro-shadow animate-slide-up">
            <h2 className="font-headline font-semibold text-lg text-primary mb-4">Profil Bilgileri</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                A
              </div>
              <div>
                <button className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs font-semibold tracking-wider uppercase hover:bg-surface-container-high transition-colors">
                  Fotoğrafı Değiştir
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Ad Soyad</label>
                <input type="text" disabled value="Ali Yılmaz" className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm opacity-70 cursor-not-allowed" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant">E-posta</label>
                <input type="email" disabled value="admin@sme.com" className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm opacity-70 cursor-not-allowed" />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Firma Adı</label>
                <input type="text" disabled value="SME Orchestrator A.Ş." className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm opacity-70 cursor-not-allowed" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Kaydet
              </button>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 micro-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h2 className="font-headline font-semibold text-lg text-primary mb-4">Sistem Tercihleri</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Yapay Zeka Asistanı (Proaktif Mod)</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Sistem, stok ve satış verilerini inceleyerek otomatik bildirimler gönderir.</p>
                </div>
                {/* Mockup Toggle */}
                <div className="w-12 h-6 bg-secondary rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-on-secondary rounded-full transform translate-x-6 shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Karanlık Mod (Dark Mode)</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Arayüz temasını sistem tercihine göre ayarlar.</p>
                </div>
                {/* Mockup Toggle Off */}
                <div className="w-12 h-6 bg-surface-variant rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-on-surface-variant rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
