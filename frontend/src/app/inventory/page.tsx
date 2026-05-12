"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { getProducts, getLowStock, restockProduct, getPrediction, createProduct, importProductsCSV, type ProductList, type LowStockList, type PredictionResult } from "@/lib/api";
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
  const [activeModal, setActiveModal] = useState<{ type: "email" | "edit" | "predict" | "add"; product?: any } | null>(null);
  
  // New States for Import / Add
  const [importingCsv, setImportingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addForm, setAddForm] = useState({ name: "", category: "Genel", unit_price: 0, stock_quantity: 0, stock_unit: "Adet", low_stock_threshold: 20 });
  const [addingProduct, setAddingProduct] = useState(false);

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

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

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingCsv(true);
    try {
      const res = await importProductsCSV(file);
      setToastMessage(res.message);
      fetchProducts(selectedCategory);
      fetchLowStock();
    } catch (err: any) {
      setToastMessage(`Hata: ${err.message}`);
    } finally {
      setImportingCsv(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      const res = await createProduct(addForm);
      setToastMessage(res.message);
      setActiveModal(null);
      setAddForm({ name: "", category: "Genel", unit_price: 0, stock_quantity: 0, stock_unit: "Adet", low_stock_threshold: 20 });
      fetchProducts(selectedCategory);
      fetchLowStock();
    } catch (err: any) {
      setToastMessage(`Ekleme hatası: ${err.message}`);
    } finally {
      setAddingProduct(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
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

  const handleExport = () => {
    if (!filteredProducts || filteredProducts.length === 0) return;
    
    const headers = ["ID,Ürün Adı,Kategori,Stok Miktarı,Birim,Birim Fiyat,Durum"];
    const rows = filteredProducts.map(p => 
      `${p.id},"${p.name}","${p.category}",${p.stock_quantity},${p.stock_unit},${p.unit_price},"${p.status}"`
    );
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `envanter_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setActiveModal({ type: "add" })}
              className="flex items-center gap-1 px-3 md:px-4 py-2 border border-outline-variant rounded-lg bg-primary text-on-primary shadow-sm hover:elevation-1 transition-all text-xs font-semibold tracking-wider uppercase"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">Yeni Ekle</span>
            </button>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleCsvImport} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={importingCsv}
              className="flex items-center gap-1 px-3 md:px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors text-xs font-semibold tracking-wider uppercase"
            >
              {importingCsv ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">upload</span>
              )}
              <span className="hidden sm:inline">İçe Aktar</span>
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 md:px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors text-xs font-semibold tracking-wider uppercase"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="hidden sm:inline">Dışa Aktar</span>
            </button>
          </div>
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
                            <button
                              onClick={() => setActiveModal({ type: p.status === "Low Stock" ? "email" : p.status === "Out of Stock" ? "edit" : "predict", product: p })}
                              className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 active:scale-95 ${
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
                    <PredictionModal
                      productId={activeModal.product.id}
                      prediction={prediction}
                      loading={predictionLoading}
                      error={predictionError}
                      onLoad={() => {
                        setPredictionLoading(true);
                        setPredictionError(null);
                        setPrediction(null);
                        getPrediction(activeModal.product.id)
                          .then((data) => setPrediction(data))
                          .catch(() => setPredictionError("Tahmin verileri yüklenemedi."))
                          .finally(() => setPredictionLoading(false));
                      }}
                      onClose={() => setActiveModal(null)}
                    />
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

                  {activeModal.type === "add" && (
                    <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                      <div>
                        <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Ürün Adı</label>
                        <input required type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface-container-lowest outline-none focus:border-secondary" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Kategori</label>
                          <input required type="text" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface-container-lowest outline-none focus:border-secondary" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Birim Fiyat (₺)</label>
                          <input required type="number" step="0.01" min="0" value={addForm.unit_price} onChange={e => setAddForm({...addForm, unit_price: parseFloat(e.target.value)})} className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface-container-lowest outline-none focus:border-secondary" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Stok Miktarı</label>
                          <input required type="number" min="0" value={addForm.stock_quantity} onChange={e => setAddForm({...addForm, stock_quantity: parseInt(e.target.value)})} className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface-container-lowest outline-none focus:border-secondary" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Stok Birimi</label>
                          <select value={addForm.stock_unit} onChange={e => setAddForm({...addForm, stock_unit: e.target.value})} className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface-container-lowest outline-none focus:border-secondary">
                            <option value="Adet">Adet</option>
                            <option value="Kg">Kg</option>
                            <option value="Litre">Litre</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Kritik Stok Eşiği</label>
                        <input required type="number" min="0" value={addForm.low_stock_threshold} onChange={e => setAddForm({...addForm, low_stock_threshold: parseInt(e.target.value)})} className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface-container-lowest outline-none focus:border-secondary" />
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-surface-container transition-colors">İptal</button>
                        <button type="submit" disabled={addingProduct} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50">
                          {addingProduct ? "Ekleniyor..." : "Ürünü Ekle"}
                        </button>
                      </div>
                    </form>
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

/** Real AI Prediction Modal — fetches and displays actual order history analysis */
function PredictionModal({ productId, prediction, loading, error, onLoad, onClose }: {
  productId: number;
  prediction: PredictionResult | null;
  loading: boolean;
  error: string | null;
  onLoad: () => void;
  onClose: () => void;
}) {
  // Trigger data load on mount
  useEffect(() => { onLoad(); }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-8 h-8 border-3 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-on-surface-variant">Sipariş geçmişi analiz ediliyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-8 gap-3">
        <span className="material-symbols-outlined text-3xl text-error">error</span>
        <p className="text-sm text-error font-semibold">{error}</p>
        <button onClick={onLoad} className="px-4 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors">Tekrar Dene</button>
      </div>
    );
  }

  if (!prediction) return null;

  const { product, analysis, forecast, insight, reorder } = prediction;
  const maxForecast = Math.max(...forecast.daily, 1);
  const dayLabels = ['Yarın', '+2', '+3', '+4', '+5', '+6', '+7'];

  return (
    <div className="flex flex-col gap-5">
      {/* Product header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">trending_up</span>
        </div>
        <div>
          <h4 className="text-lg font-bold">{product.name}</h4>
          <p className="text-xs text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">category</span> {product.category}
            <span className="text-outline-variant">|</span>
            <span className="material-symbols-outlined text-[14px]">inventory_2</span> Stok: {product.stock_quantity} {product.stock_unit}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface-container-low rounded-lg p-3 text-center">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">90 Gün Satış</p>
          <p className="text-lg font-bold text-primary">{analysis.total_sold_90d}</p>
        </div>
        <div className="bg-surface-container-low rounded-lg p-3 text-center">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">Günlük Ort.</p>
          <p className="text-lg font-bold text-primary">{analysis.daily_velocity}</p>
        </div>
        <div className="bg-surface-container-low rounded-lg p-3 text-center">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">Haftalık Trend</p>
          <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
            analysis.trend_direction === 'up' ? 'text-error' : analysis.trend_direction === 'down' ? 'text-secondary' : 'text-on-surface'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {analysis.trend_direction === 'up' ? 'trending_up' : analysis.trend_direction === 'down' ? 'trending_down' : 'trending_flat'}
            </span>
            %{analysis.trend_percent.toFixed(0)}
          </p>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary mt-0.5">insights</span>
        <p className="text-sm text-on-surface leading-relaxed" dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      </div>

      {/* 7-day forecast chart */}
      <div>
        <h5 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-3">Önümüzdeki 7 Günlük Talep Tahmini (Adet)</h5>
        <div className="h-32 flex items-end justify-between gap-2 pb-2">
          {forecast.daily.map((val, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-2 group">
              <div
                className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors relative"
                style={{ height: `${(val / maxForecast) * 100}%`, minHeight: val > 0 ? '4px' : '0px', animation: `slide-up 0.4s ease-out ${i * 50}ms both` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {val}
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stockout + reorder info */}
      <div className="flex gap-3">
        {forecast.days_until_stockout !== null && (
          <div className={`flex-1 p-3 rounded-lg border ${
            forecast.days_until_stockout <= 7 ? 'border-error/30 bg-error-container/10' : 'border-outline-variant bg-surface-container-low'
          }`}>
            <p className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">Stok Yeterlilik</p>
            <p className={`text-lg font-bold ${forecast.days_until_stockout <= 7 ? 'text-error' : 'text-on-surface'}`}>
              ~{Math.round(forecast.days_until_stockout)} gün
            </p>
          </div>
        )}
        <div className="flex-1 p-3 rounded-lg border border-outline-variant bg-surface-container-low">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">Önerilen Sipariş</p>
          <p className="text-lg font-bold text-primary">{reorder.suggested_quantity} {product.stock_unit}</p>
          <p className="text-[10px] text-on-surface-variant">Tahmini: ₺{reorder.estimated_cost.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      <button onClick={onClose} className="mt-1 px-6 py-2 text-sm font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors self-center">Kapat</button>
    </div>
  );
}
