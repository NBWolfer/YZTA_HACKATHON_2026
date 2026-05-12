"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@sme.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-tertiary-fixed/20 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '10s', animationDelay: '1s' }} />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 mx-4 bg-surface-container-lowest/70 backdrop-blur-xl border border-outline-variant/50 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] transition-all duration-300">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/30 mb-6 transform hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-3xl">hub</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-primary mb-2 tracking-tight">SME Orchestrator</h1>
          <p className="text-on-surface-variant text-sm">Yönetim paneline giriş yapın</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant ml-1">
              E-posta Adresi
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="admin@sme.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant ml-1">
              Şifre
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full bg-primary text-on-primary py-3.5 rounded-xl text-sm font-semibold tracking-wider uppercase overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {/* Hover Effect */}
            <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-[400ms] ease-out group-hover:w-full" />
            
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-on-surface-variant flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
            Sadece yetkili personel erişebilir.
          </p>
        </div>

      </div>
    </div>
  );
}
