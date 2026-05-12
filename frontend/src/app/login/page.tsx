"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPwdOpen, setIsForgotPwdOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        localStorage.setItem("user", JSON.stringify(res.user));
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Giriş yapılamadı. E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-bright border border-outline-variant rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="p-8 text-center bg-surface-container-low border-b border-outline-variant">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary flex items-center justify-center text-on-primary mb-4 shadow-md">
            <span className="material-symbols-outlined text-2xl">hub</span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-primary">SME Orchestrator</h1>
          <p className="text-sm text-on-surface-variant mt-2">Yönetim paneline giriş yapın</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">E-posta</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                placeholder="ornek@sirket.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Şifre</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex justify-between items-center text-sm mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                <span className="text-on-surface-variant">Beni hatırla</span>
              </label>
              <button 
                type="button"
                onClick={() => setIsForgotPwdOpen(true)} 
                className="text-secondary font-semibold hover:underline"
              >
                Şifremi unuttum
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full py-3 bg-primary text-on-primary rounded-xl font-semibold tracking-wide hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" /> : "Giriş Yap"}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Hesabınız yok mu? <Link href="/signup" className="text-primary font-semibold hover:underline">Hemen kayıt olun</Link>
          </p>
        </div>
      </div>

      {mounted && typeof document !== "undefined" && createPortal(
        isForgotPwdOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
              <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="font-headline font-semibold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">lock_reset</span>
                  Şifremi Unuttum
                </h3>
                <button 
                  onClick={() => setIsForgotPwdOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <p className="text-sm text-on-surface-variant">Şifrenizi sıfırlamak için lütfen sistem yöneticisi ile iletişime geçin veya aşağıdaki adrese e-posta gönderin.</p>
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant flex items-center gap-2 text-sm font-medium">
                  <span className="material-symbols-outlined text-outline text-[18px]">mail</span>
                  destek@sme-orchestrator.com
                </div>
                <button 
                  onClick={() => setIsForgotPwdOpen(false)} 
                  className="w-full mt-2 py-2 bg-secondary text-on-secondary rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Anladım
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  );
}
