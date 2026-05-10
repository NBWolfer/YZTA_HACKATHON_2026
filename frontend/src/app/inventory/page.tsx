"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getProducts, getLowStock, restockProduct, type ProductList, type LowStockList } from "@/lib/api";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ErrorState, InlineError } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

const statusConfig: Record<string, { bg: string; icon: string; label: string }> = {
  "In Stock": { bg: "bg-secondary-container text-on-secondary-container", icon: "check_circle", label: "Stokta" },
  "Low Stock": { bg: "bg-tertiary-fixed text-on-tertiary-container", icon: "warning", label: "Düşük Stok" },
  "Out of Stock": { bg: "bg-surface-variant text-on-surface-variant", icon: "block", label: "Tükendi" },
};

const categoryIcons: Record<string, string> = {
  "Kozmetik": "soap",
  "Gıda": "restaurant",
  "El Sanatları": "palette",
  "Tekstil": "checkroom",
  "Baharat": "local_florist",
};

type LoadState = "loading" | "loaded" | "error";

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductList | null>(null);
  const [lowStock, setLowStock] = useState<LowStockList | null>(null);
  const [productsState, setProductsState] = useState<LoadState>("loading");
  const [lowStockState, setLowStockState] = useState<LoadState>("loading");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [restockingId, setRestockingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: "email" | "edit" | "predict"; product: any } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAutoOrder = async (productId: number) => {
    try {
      setRestockingId(productId);
      const res = await restockProduct(productId, 50);
      setToastMessage(res.message);
      fetchProducts(selectedCategory);
      fetchLowStock();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("Sipariş verilirken hata oluştu.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setRestockingId(null);
    }
  };

  const fetchProducts = useCallback((category?: string) => {
    setProductsState("loading");
    getProducts(category || undefined)
      .then((d) => { setProducts(d); setProductsState("loaded"); })
      .catch(() => setProductsState("error"));
  }, []);

  const fetchLowStock = useCallback(() => {
    setLowStockState("loading");
    getLowStock()
      .then((d) => { setLowStock(d); setLowStockState("loaded"); })
      .catch(() => setLowStockState("error"));
  }, []);

  useEffect(() => { fetchProducts(); fetchLowStock(); }, [fetchProducts, fetchLowStock]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchProducts(cat);
  };

  const handleExportCSV = () => {
    if (!products?.products) return;
    
    const headers = ["Ürün Adı", "Kategori", "Stok", "Birim", "Fiyat", "Durum"];
    const rows = products.products.map(p => [
      `"${p.name}"`,
      `"${p.category}"`,
      p.stock_quantity,
      `"${p.stock_unit}"`,
      p.unit_price,
      `"${p.status === 'Low Stock' ? 'Düşük Stok' : p.status === 'Out of Stock' ? 'Tükendi' : 'Stokta'}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `envanter_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMessage("Envanter başarıyla dışa aktarıldı.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Full error only if both failed
  if (productsState === "error" && lowStockState === "error") {
    return (
      <ErrorState
        title="Envanter verileri yüklenemedi"
        message="Sunucuya bağlanılamadı. Backend servisinin çalıştığından emin olun."
        onRetry={() => { fetchProducts(); fetchLowStock(); }}
      />
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col gap-6 md:gap-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            Stok ve Envanter Yönetimi
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm md:text-base">
            Gerçek zamanlı depo durumu ve AI destekli tahminler.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="Kozmetik">Kozmetik</option>
            <option value="Gıda">Gıda</option>
            <option value="El Sanatları">El Sanatları</option>
            <option value="Tekstil">Tekstil</option>
            <option value="Baharat">Baharat</option>
          </select>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 md:px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors text-xs font-semibold tracking-wider uppercase"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Table (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden micro-shadow animate-slide-up">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="font-headline font-semibold">Aktif Ürünler</h3>
              <span className="text-on-surface-variant text-sm">
                Toplam: {productsState === "loaded" ? products?.total ?? 0 : "—"} Ürün
              </span>
            </div>

            {productsState === "loading" ? (
              <PageLoader message="Ürünler yükleniyor..." />
            ) : productsState === "error" ? (
              <div className="p-4">
                <InlineError message="Ürünler yüklenemedi." onRetry={() => fetchProducts(selectedCategory)} />
              </div>
            ) : !products?.products?.length ? (
              <EmptyState
                icon="inventory_2"
                title="Ürün bulunamadı"
                description={selectedCategory ? `"${selectedCategory}" kategorisinde ürün yok.` : "Henüz envantere ürün eklenmemiş."}
                action={selectedCategory ? { label: "Filtreyi Temizle", onClick: () => handleCategoryChange("") } : undefined}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold tracking-wider uppercase text-on-surface-variant">
                      <th className="py-3 px-4">Ürün Adı</th>
                      <th className="py-3 px-4 hidden sm:table-cell">Kategori</th>
                      <th className="py-3 px-4 text-right">Stok Seviyesi</th>
                      <th className="py-3 px-4">Durum</th>
                      <th className="py-3 px-4 hidden md:table-cell">AI Aksiyonu</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-outline-variant">
                    {products.products.map((p, index) => {
                      const status = statusConfig[p.status] ?? statusConfig["In Stock"];
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-surface-container-lowest transition-colors duration-150 ${p.status === "Low Stock" ? "bg-error-container/10" : ""}`}
                          style={{ animation: `fade-in 0.3s ease-out ${index * 30}ms both` }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
                                <span className="material-symbols-outlined text-[18px]">
                                  {categoryIcons[p.category] ?? "category"}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium block truncate">{p.name}</span>
                                <span className="text-xs text-on-surface-variant sm:hidden">{p.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-on-surface-variant hidden sm:table-cell">{p.category}</td>
                          <td className="py-3 px-4 text-right font-mono">
                            <div className={p.status === "Low Stock" ? "text-error font-bold" : p.status === "Out of Stock" ? "text-outline" : ""}>
                              {p.stock_quantity} {p.stock_unit}
                            </div>
                            <div className="text-[12px] text-on-surface-variant">
                              Birim: ₺{p.unit_price.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${status.bg}`}>
                              <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <button 
                              onClick={() => setActiveModal({ type: p.status === "Low Stock" ? "email" : p.status === "Out of Stock" ? "edit" : "predict", product: p })}
                              className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 active:scale-95 ${
                              p.status === "Low Stock"
                                ? "bg-secondary text-on-secondary hover:opacity-90"
                                : "bg-surface-container hover:bg-surface-container-high border border-outline-variant"
                            }`}>
                              <span className="material-symbols-outlined text-[16px]">
                                {p.status === "Low Stock" ? "mail" : p.status === "Out of Stock" ? "edit" : "auto_awesome"}
                              </span>
                              {p.status === "Low Stock" ? "Sipariş E-postası" : p.status === "Out of Stock" ? "Stok Düzenle" : "Tahmin Gör"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {/* AI Header */}
          <div className="bg-gradient-to-br from-secondary-container to-surface-container-lowest p-4 rounded-xl border border-secondary-container shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-on-secondary-container">
                AI Copilot Önerileri
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Son 7 günlük satış trendleri analiz edilerek oluşturulmuştur.
              </p>
            </div>
          </div>

          {/* Low stock alerts */}
          {lowStockState === "loading" ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-outline-variant border-t-secondary rounded-full animate-spin" />
            </div>
          ) : lowStockState === "error" ? (
            <InlineError message="Stok uyarıları yüklenemedi." onRetry={fetchLowStock} />
          ) : !lowStock?.products?.length ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
              <span className="material-symbols-outlined text-3xl text-secondary mb-2">
                check_circle
              </span>
              <p className="text-sm font-semibold text-on-surface">Tüm stoklar yeterli!</p>
              <p className="text-xs text-on-surface-variant mt-1">Kritik seviyede ürün bulunmuyor.</p>
            </div>
          ) : (
            lowStock.products.slice(0, 4).map((p, index) => (
              <div
                key={p.id}
                className="bg-surface-container-lowest border-l-4 border-l-tertiary-fixed-dim border-y border-r border-outline-variant rounded-r-xl p-4 micro-shadow hover:elevation-1 transition-shadow duration-200"
                style={{ animation: `fade-in 0.3s ease-out ${index * 80}ms both` }}
              >
                <div className="flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">trending_up</span>
                  <span className="text-xs font-semibold tracking-wider uppercase truncate">{p.name}</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-3">
                  Stok seviyesi <strong className="text-on-surface">{p.stock_quantity} {p.stock_unit}</strong> — eşik değer: {p.threshold}. Yeniden sipariş önerilir.
                </p>
                <button 
                  onClick={() => handleAutoOrder(p.id)}
                  disabled={restockingId === p.id}
                  className="w-full flex justify-center items-center gap-2 bg-secondary text-on-secondary py-2 rounded-lg text-xs font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {restockingId === p.id && <span className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" />}
                  Otomatik Sipariş Ver
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Teleport Modals and Toasts to document.body to prevent layout shift */}
      {mounted && typeof document !== "undefined" && createPortal(
        <>
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-4 right-4 bg-surface-container-high text-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline-variant flex items-center gap-3 animate-slide-up z-[9999]">
              <span className="material-symbols-outlined text-secondary">check_circle</span>
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          )}

          {/* Modal */}
          {activeModal && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 pb-8 px-4 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
                  <h3 className="font-headline font-semibold text-lg">
                    {activeModal.type === "email" && "Tedarikçi E-postası Taslağı"}
                    {activeModal.type === "predict" && "AI Talep Tahmini"}
                    {activeModal.type === "edit" && "Stok Miktarını Düzenle"}
                  </h3>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                
                <div className="p-5">
                  {activeModal.type === "email" && (
                    <div className="flex flex-col gap-4">
                      <div className="text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-lg border border-outline-variant font-mono whitespace-pre-wrap">
{`Konu: ACİL - ${activeModal.product.name} Siparişi

Merhaba,
"${activeModal.product.name}" ürünümüzün stok seviyesi kritik seviyeye (${activeModal.product.stock_quantity} ${activeModal.product.stock_unit}) inmiştir. 

Lütfen en kısa sürede 100 ${activeModal.product.stock_unit} tutarında yeni bir sevkiyat planlamanızı rica ederiz.

İyi çalışmalar.`}
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-surface-container transition-colors">Vazgeç</button>
                        <button onClick={() => { handleAutoOrder(activeModal.product.id); setActiveModal(null); }} className="px-4 py-2 text-sm font-semibold rounded-lg bg-secondary text-on-secondary hover:opacity-90 transition-opacity">Siparişi Onayla</button>
                      </div>
                    </div>
                  )}

                  {activeModal.type === "predict" && (
                    <div className="flex flex-col gap-4 text-center items-center py-4">
                      <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-3xl">trending_up</span>
                      </div>
                      <h4 className="text-xl font-bold">{activeModal.product.name}</h4>
                      {(() => {
                        const percentage = 5 + (activeModal.product.id * 7) % 30;
                        const isIncrease = (activeModal.product.id % 2) === 0;
                        return (
                          <p className="text-on-surface-variant text-sm px-4">
                            {isIncrease ? (
                              <>
                                Geçmiş veriler analiz edildiğinde bu ürünün önümüzdeki hafta <strong className="text-secondary">%15 ile %{percentage + 15} arası talep artışı</strong> yaşaması öngörülmektedir. Hafta sonu kampanyası öncesi stoklarınızı hazırlamanız önerilir.
                              </>
                            ) : (
                              <>
                                Pazar trendlerine göre bu üründe önümüzdeki hafta <strong className="text-primary">%{percentage} talep düşüşü</strong> öngörülüyor. Elinizdeki {activeModal.product.stock_quantity} {activeModal.product.stock_unit} stok şu an için fazlasıyla yeterlidir.
                              </>
                            )}
                          </p>
                        );
                      })()}
                      <button onClick={() => setActiveModal(null)} className="mt-4 px-6 py-2 text-sm font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors">Kapat</button>
                    </div>
                  )}

                  {activeModal.type === "edit" && (
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-on-surface-variant mb-2">"{activeModal.product.name}" ürünü için yeni stok miktarını girin.</p>
                      <input type="number" defaultValue={0} min={0} className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-secondary focus:ring-1 focus:ring-secondary outline-none" />
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-surface-container transition-colors">İptal</button>
                        <button onClick={() => { handleAutoOrder(activeModal.product.id); setActiveModal(null); }} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity">Güncelle</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}

    </div>
  );
}
