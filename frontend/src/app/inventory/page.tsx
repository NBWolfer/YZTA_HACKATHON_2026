"use client";

import { useEffect, useState, useCallback } from "react";
import { getProducts, getLowStock, type ProductList, type LowStockList } from "@/lib/api";
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
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const filteredProducts = products?.products?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Ürün Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 pl-9 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
            />
          </div>
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
          <button className="flex items-center gap-1 px-3 md:px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors text-xs font-semibold tracking-wider uppercase">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 micro-shadow flex flex-col justify-between h-28 hover:elevation-1 transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Toplam Ürün</span>
            <span className="material-symbols-outlined text-outline">inventory_2</span>
          </div>
          <span className="font-headline text-3xl font-bold text-primary">{productsState === "loaded" ? products?.total ?? 0 : "—"}</span>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 micro-shadow flex flex-col justify-between h-28 hover:elevation-1 transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Kategoriler</span>
            <span className="material-symbols-outlined text-outline">category</span>
          </div>
          <span className="font-headline text-3xl font-bold text-primary">5</span>
        </div>
        <div className="bg-surface-container-lowest border-l-4 border-l-tertiary-fixed-dim border-y border-r border-outline-variant rounded-xl p-4 micro-shadow flex flex-col justify-between h-28 hover:elevation-1 transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold tracking-wider uppercase text-tertiary">Kritik Stok</span>
            <span className="material-symbols-outlined text-tertiary">warning</span>
          </div>
          <span className="font-headline text-3xl font-bold text-tertiary">{lowStockState === "loaded" ? lowStock?.products?.length ?? 0 : "—"}</span>
        </div>
        <div className="bg-surface-container-lowest border-l-4 border-l-error border-y border-r border-outline-variant rounded-xl p-4 micro-shadow flex flex-col justify-between h-28 hover:elevation-1 transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold tracking-wider uppercase text-error">Tükenen</span>
            <span className="material-symbols-outlined text-error">block</span>
          </div>
          <span className="font-headline text-3xl font-bold text-error">{productsState === "loaded" ? products?.products?.filter(p => p.status === "Out of Stock").length ?? 0 : "—"}</span>
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
            ) : !filteredProducts?.length ? (
              <EmptyState
                icon="search_off"
                title="Ürün bulunamadı"
                description={searchQuery ? `"${searchQuery}" aramasına uygun ürün yok.` : selectedCategory ? `"${selectedCategory}" kategorisinde ürün yok.` : "Henüz envantere ürün eklenmemiş."}
                action={(searchQuery || selectedCategory) ? { label: "Filtreyi Temizle", onClick: () => { handleCategoryChange(""); setSearchQuery(""); } } : undefined}
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
                    {filteredProducts.map((p, index) => {
                      const status = statusConfig[p.status] ?? statusConfig["In Stock"];
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-surface-container transition-all duration-200 group border-b border-outline-variant/50 last:border-0 ${p.status === "Low Stock" ? "bg-tertiary-fixed/10 hover:bg-tertiary-fixed/20" : ""}`}
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
                            <button className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                              p.status === "Low Stock"
                                ? "bg-secondary text-on-secondary hover:opacity-90 shadow-sm"
                                : "bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20"
                            }`}>
                              <span className="material-symbols-outlined text-[16px]">
                                {p.status === "Low Stock" ? "mail" : p.status === "Out of Stock" ? "edit" : "auto_awesome"}
                              </span>
                              {p.status === "Low Stock" ? "Sipariş Geç" : p.status === "Out of Stock" ? "Stok Güncelle" : "Tahmin Gör"}
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
                <button className="w-full bg-secondary text-on-secondary py-2 rounded-lg text-xs font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity active:scale-[0.98]">
                  Otomatik Sipariş Ver
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
