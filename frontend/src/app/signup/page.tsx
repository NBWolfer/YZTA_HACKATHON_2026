"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signup({ name, email, password });
      if (res.success) {
        localStorage.setItem("user", JSON.stringify(res.user));
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Kayıt işlemi başarısız oldu. E-posta adresi kullanımda olabilir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-bright border border-outline-variant rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="p-8 text-center bg-surface-container-low border-b border-outline-variant">
          <h1 className="text-2xl font-bold font-headline text-primary">Kayıt Ol</h1>
          <p className="text-sm text-on-surface-variant mt-2">SME Orchestrator ile işletmenizi büyütün</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Ad Soyad</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
            
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
                placeholder="En az 6 karakter"
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full py-3 bg-secondary text-on-secondary rounded-xl font-semibold tracking-wide hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? <span className="w-5 h-5 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" /> : "Hesap Oluştur"}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Zaten hesabınız var mı? <Link href="/login" className="text-secondary font-semibold hover:underline">Giriş yapın</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
