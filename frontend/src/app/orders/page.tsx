"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrders, type OrderList } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineError } from "@/components/ui/ErrorState";
import { PageLoader } from "@/components/ui/LoadingSpinner";

// Mock data for procurement orders
const procurementOrders = [
  { id: "PO-2026-081", supplier: "Kimya Deposu A.Ş.", item: "Lavanta Esansı (5 Lt)", status: "Yolda", amount: "₺3,200", date: "10 Mayıs 2026" },
  { id: "PO-2026-080", supplier: "Bursa Tekstil Toptan", item: "Keten Kumaş (100 m)", status: "Tamamlandı", amount: "₺8,500", date: "05 Mayıs 2026" },
  { id: "PO-2026-079", supplier: "Ege Zeytincilik", item: "Saf Zeytinyağı (100 Lt)", status: "Tamamlandı", amount: "₺12,000", date: "28 Nisan 2026" },
];

export default function OrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [crisisResolved, setCrisisResolved] = useState(false);
  const [activeTab, setActiveTab] = useState<"b2c" | "b2b">("b2b");

  // B2C real data
  const [b2cOrders, setB2cOrders] = useState<OrderList | null>(null);
  const [b2cState, setB2cState] = useState<"idle" | "loading" | "loaded" | "error">("idle");

  const handleSendDraft = () => {
    setIsSending(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSending(false);
      setIsModalOpen(false);
      setCrisisResolved(true);
    }, 1500);
  };

  // Fetch B2C orders when tab is activated
  const fetchB2cOrders = useCallback(() => {
    setB2cState("loading");
    getOrders()
      .then((data) => { setB2cOrders(data); setB2cState("loaded"); })
      .catch(() => setB2cState("error"));
  }, []);

  useEffect(() => {
    if (activeTab === "b2c" && b2cState === "idle") {
      fetchB2cOrders();
    }
  }, [activeTab, b2cState, fetchB2cOrders]);

  const statusColors: Record<string, string> = {
    "Hazırlanıyor": "bg-surface-container-high text-on-surface-variant",
    "Kargoya Verildi": "bg-secondary-container text-on-secondary-container",
    "Yolda": "bg-secondary-container text-on-secondary-container",
    "Teslim Edildi": "bg-[#D1FAE5] text-[#065F46]",
    "İptal": "bg-error-container text-on-error-container",
  };

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col gap-6 md:gap-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">local_shipping</span>
            Siparişler & Akıllı Tedarik
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm md:text-base">
            Müşteri siparişlerinizi ve tedarik zincirinizi yönetin. Otonom AI asistanınız krizleri sizin yerinize çözer.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/50">
        <button
          onClick={() => setActiveTab("b2b")}
          className={`px-4 py-3 text-sm font-semibold tracking-wider uppercase transition-colors relative ${activeTab === "b2b" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          Satın Alma (Tedarik)
          {activeTab === "b2b" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("b2c")}
          className={`px-4 py-3 text-sm font-semibold tracking-wider uppercase transition-colors relative ${activeTab === "b2c" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          Müşteri Siparişleri (B2C)
          {activeTab === "b2c" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Content based on Tab */}
      {activeTab === "b2b" ? (
        <div className="flex flex-col gap-8">
          
          {/* AI Crisis & Action Center */}
          {!crisisResolved ? (
            <div className="bg-surface-container-lowest border border-error/30 rounded-2xl overflow-hidden micro-shadow animate-slide-up relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-error" />
              
              <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-error-container/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-error mb-2">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                    <h2 className="font-headline text-lg font-bold">Kritik Stok Uyarısı: Üretim Beklemede</h2>
                  </div>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-4">
                    Sipariş <strong className="text-on-surface">#1042</strong> (150 Adet Zeytinyağlı Sabun) için gerekli olan <strong className="text-on-surface">Saf Zeytinyağı</strong> stoklarımızda kalmamıştır. Sipariş hazırlık sürecine geçemiyor.
                  </p>
                  
                  {/* AI Solution */}
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 flex items-start gap-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                    <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-primary">SME Copilot Çözümü Hazır</h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Kayıtlı tedarikçiniz <strong>Ege Zeytincilik (Ahmet Bey)</strong> için acil 100 Lt. Saf Zeytinyağı siparişi ve e-posta taslağı oluşturdum. Onayınızla anında gönderilecektir.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full lg:w-auto px-6 py-4 bg-primary text-on-primary rounded-xl text-sm font-bold tracking-wider uppercase hover:opacity-90 transition-opacity shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">visibility</span>
                    Taslağı İncele ve Onayla
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="bg-surface-container-lowest border border-[#D1FAE5] rounded-2xl p-6 md:p-8 flex items-center gap-4 micro-shadow animate-slide-up bg-[#F0FDF4]">
              <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>
              <div>
                <h2 className="font-headline text-lg font-bold text-[#065F46]">Kriz Çözüldü: Sipariş Gönderildi</h2>
                <p className="text-sm text-[#065F46]/80 mt-1">
                  Ege Zeytincilik tedarikçisine e-posta başarıyla iletildi. Zeytinyağı stokları 2 iş günü içinde teslim edilecek. Müşteri (Sipariş #1042) bilgilendirildi.
                </p>
              </div>
            </div>
          )}

          {/* Past Procurement Orders */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden micro-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="font-headline font-semibold text-primary">Tedarik Geçmişi (B2B)</h3>
              <button className="text-xs font-semibold tracking-wider uppercase text-secondary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Filtrele
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low text-xs font-semibold tracking-wider uppercase text-on-surface-variant border-b border-outline-variant">
                    <th className="py-4 px-6">Sipariş No</th>
                    <th className="py-4 px-6">Tedarikçi</th>
                    <th className="py-4 px-6">Malzeme / Ürün</th>
                    <th className="py-4 px-6">Tarih</th>
                    <th className="py-4 px-6 text-right">Tutar</th>
                    <th className="py-4 px-6 text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-outline-variant">
                  {/* If crisis is resolved, show the newly created order at the top */}
                  {crisisResolved && (
                    <tr className="hover:bg-surface-container transition-colors bg-[#F0FDF4]/30 animate-fade-in">
                      <td className="py-4 px-6 font-mono text-primary font-medium">PO-2026-082</td>
                      <td className="py-4 px-6 font-semibold">Ege Zeytincilik</td>
                      <td className="py-4 px-6">Saf Zeytinyağı (100 Lt)</td>
                      <td className="py-4 px-6 text-on-surface-variant">Şimdi</td>
                      <td className="py-4 px-6 text-right font-mono">₺12,000</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-tertiary-fixed text-on-tertiary-container">
                          <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                          Onay Bekliyor
                        </span>
                      </td>
                    </tr>
                  )}
                  {procurementOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container transition-colors group">
                      <td className="py-4 px-6 font-mono text-on-surface-variant group-hover:text-primary transition-colors">{order.id}</td>
                      <td className="py-4 px-6 font-medium">{order.supplier}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{order.item}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{order.date}</td>
                      <td className="py-4 px-6 text-right font-mono">
                        {order.amount}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          order.status === "Tamamlandı" 
                            ? "bg-[#D1FAE5] text-[#065F46]" 
                            : "bg-secondary-container text-on-secondary-container"
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {order.status === "Tamamlandı" ? "check_circle" : "local_shipping"}
                          </span>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* B2C — Real orders from backend */
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden micro-shadow animate-slide-up">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
            <h3 className="font-headline font-semibold text-primary">Müşteri Siparişleri (B2C)</h3>
            <span className="text-xs text-on-surface-variant font-mono">
              {b2cState === "loaded" ? `${b2cOrders?.total ?? 0} sipariş` : ""}
            </span>
          </div>

          {b2cState === "loading" ? (
            <PageLoader message="Siparişler yükleniyor..." />
          ) : b2cState === "error" ? (
            <div className="p-4">
              <InlineError message="Siparişler yüklenemedi." onRetry={fetchB2cOrders} />
            </div>
          ) : !b2cOrders?.orders?.length ? (
            <div className="p-8">
              <EmptyState
                icon="shopping_bag"
                title="Henüz sipariş yok"
                description="Müşteri siparişleri oluşturulduğunda burada görünecek."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low text-xs font-semibold tracking-wider uppercase text-on-surface-variant border-b border-outline-variant">
                    <th className="py-4 px-6">Sipariş No</th>
                    <th className="py-4 px-6">Müşteri</th>
                    <th className="py-4 px-6">Ürünler</th>
                    <th className="py-4 px-6 text-right">Tutar</th>
                    <th className="py-4 px-6 text-center">Durum</th>
                    <th className="py-4 px-6">Kargo</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-outline-variant">
                  {b2cOrders.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container transition-colors group">
                      <td className="py-4 px-6 font-mono text-primary font-medium">#{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold">{order.customer.name}</div>
                        <div className="text-xs text-on-surface-variant">{order.customer.city}</div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant max-w-[200px] truncate">
                        {order.items.map(i => `${i.product} (x${i.quantity})`).join(", ")}
                      </td>
                      <td className="py-4 px-6 text-right font-mono">₺{order.total_amount.toLocaleString("tr-TR")}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors[order.status] ?? "bg-surface-variant text-on-surface-variant"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant">
                        {order.cargo ? (
                          <div>
                            <div className="font-semibold text-on-surface">{order.cargo.provider}</div>
                            <div className="font-mono">{order.cargo.tracking_number}</div>
                          </div>
                        ) : (
                          <span className="text-outline">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* AI Draft Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" onClick={() => !isSending && setIsModalOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl border border-outline-variant overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            
            <div className="bg-surface-bright px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <h3 className="font-headline font-bold text-primary">SME Copilot: Taslak Önizleme</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isSending}
                className="p-1 hover:bg-surface-container-high rounded-full transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-surface-container-lowest">
              <div className="mb-4 text-sm text-on-surface-variant flex flex-col gap-1 border-b border-outline-variant pb-4">
                <p><strong>Alıcı:</strong> ahmet.bey@egezeytincilik.com</p>
                <p><strong>Konu:</strong> Acil Sipariş Talebi - Saf Zeytinyağı (100 Lt) - SME Orchestrator A.Ş.</p>
              </div>
              
              <div className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed font-sans">
                {`Merhaba Ahmet Bey,

Umarım iyisinizdir. 

Üretim hattımızda acil bir ihtiyaç doğduğu için vakit kaybetmeden sizden yeni bir sipariş geçmek istiyoruz. Daha önceki anlaşmamıza istinaden, aşağıdaki ürünün stoklarımıza en kısa sürede (tercihen 2 iş günü içinde) ulaştırılmasını rica ederiz:

- Ürün: Saf Sızma Zeytinyağı
- Miktar: 100 Litre
- Teslimat Adresi: OSB 3. Cad. No:14, Merkez Fabrika

Fatura ve ödeme işlemleri her zamanki gibi muhasebe birimimiz tarafından otomatik olarak gerçekleştirilecektir. Teslimat tarihi ile ilgili onayınızı bekliyorum.

İyi çalışmalar dilerim.

--
SME Orchestrator AI Asistanı 
(SME Orchestrator A.Ş. adına otomatik oluşturulmuştur)`}
              </div>
            </div>

            <div className="bg-surface-bright px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wider uppercase border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleSendDraft}
                disabled={isSending}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-primary/20 active:scale-95 disabled:opacity-70 w-[180px] justify-center"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Onayla ve Gönder
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
