"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";

const WA_BOT_URL = "http://localhost:3001";

export default function SettingsPage() {
  // WhatsApp bot status
  const [waStatus, setWaStatus] = useState<"checking" | "connected" | "disconnected" | "scanning">("checking");
  const [waQR, setWaQR] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Poll WhatsApp bot status
  useEffect(() => {
    let cancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${WA_BOT_URL}/api/qr`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (cancelled) return;

        if (data.authenticated || data.ready) {
          setWaStatus("connected");
          setWaQR(null);
          setQrImageUrl(null);
          if (showQRModal) setShowQRModal(false);
        } else if (data.qr) {
          setWaStatus("scanning");
          setWaQR(data.qr);
        } else {
          setWaStatus("disconnected");
        }
      } catch {
        if (!cancelled) setWaStatus("disconnected");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [showQRModal]);

  // Generate QR image when QR data changes
  useEffect(() => {
    if (!waQR) { setQrImageUrl(null); return; }
    QRCode.toDataURL(waQR, { width: 250, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then((url: string) => setQrImageUrl(url))
      .catch(() => setQrImageUrl(null));
  }, [waQR]);

  return (
    <div className="max-w-[1000px] mx-auto flex flex-col gap-6 md:gap-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">Ayarlar</h1>
        <p className="text-on-surface-variant mt-1 text-sm md:text-base">
          Sistem tercihleri, bildirimler ve entegrasyon ayarlarını yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container font-semibold transition-colors text-left w-full">
            <span className="material-symbols-outlined fill-icon">tune</span>
            Sistem Tercihleri
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors text-left w-full">
            <span className="material-symbols-outlined">notifications</span>
            Bildirimler
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors text-left w-full">
            <span className="material-symbols-outlined">extension</span>
            Entegrasyonlar
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors text-left w-full">
            <span className="material-symbols-outlined">security</span>
            Güvenlik
          </button>

          {/* Quick link to profile */}
          <div className="mt-4 pt-4 border-t border-outline-variant">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors text-left w-full text-sm"
            >
              <span className="material-symbols-outlined">person</span>
              Profil Bilgilerim
              <span className="material-symbols-outlined text-[16px] ml-auto text-outline">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* System Preferences Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 micro-shadow animate-slide-up">
            <h2 className="font-headline font-semibold text-lg text-primary mb-4">Sistem Tercihleri</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Yapay Zeka Asistanı (Proaktif Mod)</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Sistem, stok ve satış verilerini inceleyerek otomatik bildirimler gönderir.</p>
                </div>
                <div className="w-12 h-6 bg-secondary rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-on-secondary rounded-full transform translate-x-6 shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Karanlık Mod (Dark Mode)</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Arayüz temasını sistem tercihine göre ayarlar.</p>
                </div>
                <div className="w-12 h-6 bg-surface-variant rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-on-surface-variant rounded-full shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Dil / Language</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Arayüz dili ve AI yanıt dili.</p>
                </div>
                <span className="text-sm font-semibold text-primary bg-primary-container px-3 py-1 rounded-lg">Türkçe</span>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 micro-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h2 className="font-headline font-semibold text-lg text-primary mb-4">Bildirim Tercihleri</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Stok Uyarıları</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Stok seviyesi kritik eşiğin altına düştüğünde bildirim al.</p>
                </div>
                <div className="w-12 h-6 bg-secondary rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-on-secondary rounded-full transform translate-x-6 shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Sipariş Güncellemeleri</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Yeni sipariş, kargo durumu değişikliği vb. bildirimleri.</p>
                </div>
                <div className="w-12 h-6 bg-secondary rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-on-secondary rounded-full transform translate-x-6 shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Sabah Brifingi (08:00)</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Her sabah günlük sipariş özeti ve görev listesi.</p>
                </div>
                <div className="w-12 h-6 bg-secondary rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-on-secondary rounded-full transform translate-x-6 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations Card — LIVE status */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 micro-shadow animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h2 className="font-headline font-semibold text-lg text-primary mb-4">Entegrasyonlar</h2>
            
            <div className="flex flex-col gap-3">
              {/* WhatsApp — LIVE */}
              <div className="flex items-center gap-4 p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">forum</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-on-surface">WhatsApp Business</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Müşteri mesajları otomasyonu</p>
                </div>
                {waStatus === "checking" ? (
                  <span className="w-4 h-4 border-2 border-outline-variant border-t-secondary rounded-full animate-spin shrink-0" />
                ) : waStatus === "connected" ? (
                  <span className="text-xs font-semibold text-secondary flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Bağlı
                  </span>
                ) : (
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366] text-white hover:opacity-90 transition-opacity shrink-0"
                  >
                    Bağla
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-on-surface">Kargo Firmaları</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Yurtiçi, Aras, MNG entegrasyonu</p>
                </div>
                <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Bağlı
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 border border-outline-variant/50 rounded-xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-on-surface">Stok & Envanter</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Excel / ERP entegrasyonu</p>
                </div>
                <span className="text-xs font-semibold text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span> Bağlı Değil
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* WhatsApp QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                </div>
                <h3 className="font-headline font-semibold">WhatsApp Bağlantısı</h3>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              {waStatus === "disconnected" ? (
                <div className="text-center py-4">
                  <span className="material-symbols-outlined text-4xl text-error mb-3 block">error</span>
                  <p className="text-sm text-error font-semibold">WhatsApp Bot&apos;a bağlanılamıyor</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Bot servisinin <code className="bg-surface-container px-1 rounded">localhost:3001</code> adresinde çalıştığından emin olun.
                  </p>
                </div>
              ) : qrImageUrl ? (
                <>
                  <p className="text-sm text-on-surface-variant font-semibold text-center">
                    WhatsApp uygulamanızdan bu QR kodu tarayın
                  </p>
                  <div className="bg-white p-3 rounded-xl shadow-md">
                    <img src={qrImageUrl} alt="WhatsApp QR Code" width={250} height={250} className="block" />
                  </div>
                  <p className="text-xs text-outline text-center">
                    WhatsApp → Ayarlar → Bağlı Cihazlar → Cihaz Bağla
                  </p>
                </>
              ) : (
                <div className="py-8 flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-3 border-outline-variant border-t-secondary rounded-full animate-spin block" />
                  <p className="text-sm text-on-surface-variant">QR kodu yükleniyor...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
