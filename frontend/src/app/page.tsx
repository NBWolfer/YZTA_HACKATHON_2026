"use client";

import { useEffect, useState, useCallback } from "react";
import { getDashboardSummary, getRecentActivities } from "@/lib/api";
import type { DashboardSummary, RecentActivities } from "@/lib/api";
import { SkeletonCard, SkeletonTable } from "@/components/ui/LoadingSpinner";
import { ErrorState, InlineError } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

const statusColors: Record<string, string> = {
  "Hazırlanıyor": "bg-surface-container-high text-on-surface-variant",
  "Kargoya Verildi": "bg-secondary-container text-on-secondary-container",
  "Yolda": "bg-secondary-container text-on-secondary-container",
  "Teslim Edildi": "bg-[#D1FAE5] text-[#065F46]",
  "İptal": "bg-error-container text-on-error-container",
};

type LoadState = "loading" | "loaded" | "error";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<RecentActivities | null>(null);
  const [summaryState, setSummaryState] = useState<LoadState>("loading");
  const [activitiesState, setActivitiesState] = useState<LoadState>("loading");

  const fetchSummary = useCallback(() => {
    setSummaryState("loading");
    getDashboardSummary()
      .then((d) => { setSummary(d); setSummaryState("loaded"); })
      .catch(() => setSummaryState("error"));
  }, []);

  const fetchActivities = useCallback(() => {
    setActivitiesState("loading");
    getRecentActivities()
      .then((d) => { setActivities(d); setActivitiesState("loaded"); })
      .catch(() => setActivitiesState("error"));
  }, []);

  useEffect(() => { fetchSummary(); fetchActivities(); }, [fetchSummary, fetchActivities]);

  // Full-page error only if both failed
  if (summaryState === "error" && activitiesState === "error") {
    return (
      <ErrorState
        title="Bağlantı hatası"
        message="Sunucuya bağlanılamadı. Backend servisinin çalıştığından emin olun."
        onRetry={() => { fetchSummary(); fetchActivities(); }}
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6 md:gap-8 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-tight">
            Güzel sabahlar, Ali Bey!
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm md:text-base">
            İşleriniz bugün nasıl gidiyor? İşte sabah özetiniz.
          </p>
        </div>
        <div className="flex items-center gap-1 text-secondary bg-secondary-container px-3 py-1.5 rounded-full w-fit text-xs font-semibold tracking-wider uppercase">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Sistem Optimizasyonu Aktif
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 stagger-children">
        {summaryState === "loading" ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : summaryState === "error" ? (
          <div className="col-span-full">
            <InlineError message="Özet veriler yüklenemedi." onRetry={fetchSummary} />
          </div>
        ) : (
          <>
            <StatCard
              label="Bugünün Siparişleri"
              icon="shopping_cart"
              value={summary?.todays_orders ?? 0}
            />
            <StatCard
              label="Aktif Teslimatlar"
              icon="local_shipping"
              value={summary?.active_deliveries ?? 0}
              subtitle="Yolda"
            />
            <StatCard
              label="Stok Uyarıları"
              icon="warning"
              value={summary?.low_stock_alerts ?? 0}
              subtitle="Kritik Seviye"
              variant="error"
            />
            <StatCard
              label="Günlük Ciro"
              icon="payments"
              value={summary ? `₺${summary.todays_revenue.toLocaleString("tr-TR")}` : "₺0"}
            />
          </>
        )}
      </div>

      {/* Middle: AI Feed + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* AI Proactive Feed */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col overflow-hidden micro-shadow animate-slide-up">
          <div className="bg-gradient-to-r from-secondary-container/50 to-surface-container-lowest px-4 py-3 border-b border-outline-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary fill-icon">smart_toy</span>
            <h3 className="font-headline text-base md:text-lg font-semibold text-primary">
              Yapay Zeka Asistanı: Proaktif Akış
            </h3>
          </div>
          <div className="p-3 flex flex-col gap-1">
            <AIFeedItem
              icon="schedule"
              iconBg="bg-error-container text-on-error-container"
              title='Sipariş #128 için kargo gecikmesi tespit edildi. (Yurtiçi Kargo)'
              subtitle="Müşteriye bilgilendirme mesajı gönderilsin mi?"
              action="Onayla"
            />
            <AIFeedItem
              icon="inventory_2"
              iconBg="bg-tertiary-fixed text-on-tertiary-container"
              title='Lavanta Sabunu stokları kritik seviyenin altına düştü. (Kalan: 12 Adet)'
              subtitle="Üretim planına eklenmesi öneriliyor."
              action="Plana Ekle"
            />
            <div className="p-3 rounded-lg bg-surface-bright flex items-start gap-3 border border-secondary-container relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5 ml-2">
                <span className="material-symbols-outlined text-sm">drafts</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Tedarikçi için <strong className="text-primary">Zeytinyağı</strong> yeniden sipariş e-postası taslağı oluşturuluyor...
                </p>
                <p className="text-xs font-semibold text-secondary mt-1 cursor-pointer hover:underline">
                  Taslağı Görüntüle
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 micro-shadow flex flex-col animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline font-semibold text-primary text-sm md:text-base">Sipariş Hacmi (7 Gün)</h3>
            <span className="material-symbols-outlined text-outline text-sm">bar_chart</span>
          </div>
          {summaryState === "loading" ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-outline-variant border-t-secondary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-end justify-between gap-1 mt-auto h-32 pb-2">
                {(summary?.weekly_volumes ?? Array(7).fill({ count: 0 })).map((v, i) => (
                  <div
                    key={i}
                    className="w-full bg-surface-container-high rounded-t-sm hover:bg-secondary transition-colors duration-200 cursor-pointer"
                    style={{
                      height: `${Math.max((v.count / 60) * 100, 5)}%`,
                      animation: `slide-up 0.4s ease-out ${i * 60}ms both`,
                    }}
                    title={`${v.count} sipariş`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-on-surface-variant border-t border-outline-variant pt-2 font-mono">
                {(summary?.weekly_volumes ?? []).map((v, i) => (
                  <span key={i}>{v.day}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl micro-shadow overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="font-headline font-semibold text-primary text-sm md:text-base">Son Aktiviteler</h3>
          <button className="text-xs font-semibold tracking-wider uppercase text-secondary hover:underline">
            Tümünü Gör
          </button>
        </div>

        {activitiesState === "loading" ? (
          <SkeletonTable rows={4} />
        ) : activitiesState === "error" ? (
          <div className="p-4">
            <InlineError message="Aktiviteler yüklenemedi." onRetry={fetchActivities} />
          </div>
        ) : !activities?.activities?.length ? (
          <EmptyState
            icon="receipt_long"
            title="Henüz aktivite yok"
            description="Yeni siparişler geldiğinde burada görünecek."
          />
        ) : (
          <>
            {/* Header — hidden on small screens */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-surface-container-low text-xs font-semibold tracking-wider uppercase text-on-surface-variant border-b border-outline-variant">
              <div className="col-span-2">ID</div>
              <div className="col-span-4">Müşteri / Ürün</div>
              <div className="col-span-3">Durum</div>
              <div className="col-span-3 text-right">Tutar</div>
            </div>
            {/* Rows */}
            <div className="flex flex-col divide-y divide-outline-variant">
              {activities.activities.map((a) => (
                <div
                  key={a.order_id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 items-start md:items-center hover:bg-surface-container transition-colors"
                >
                  {/* Mobile: stacked layout */}
                  <div className="md:col-span-2 font-mono text-sm text-primary flex items-center justify-between md:block">
                    <span>#{a.order_id}</span>
                    <span className={`md:hidden inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${statusColors[a.status] ?? "bg-surface-variant text-on-surface-variant"}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="md:col-span-4">
                    <p className="text-sm font-semibold text-on-surface truncate">{a.customer_name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{a.product_summary}</p>
                  </div>
                  <div className="hidden md:block md:col-span-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${statusColors[a.status] ?? "bg-surface-variant text-on-surface-variant"}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="md:col-span-3 text-right font-mono text-sm">
                    ₺{a.amount.toLocaleString("tr-TR")}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({
  label, icon, value, subtitle, variant,
}: {
  label: string; icon: string; value: string | number; subtitle?: string; variant?: "error";
}) {
  return (
    <div className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-3 md:p-4 micro-shadow flex flex-col justify-between h-28 md:h-32 transition-shadow hover:elevation-1 ${variant === "error" ? "border-l-4 border-l-error" : ""}`}>
      <div className="flex justify-between items-start">
        <span className={`text-[10px] md:text-xs font-semibold tracking-wider uppercase ${variant === "error" ? "text-error" : "text-on-surface-variant"}`}>
          {label}
        </span>
        <span className={`material-symbols-outlined text-lg md:text-2xl ${variant === "error" ? "text-error" : "text-outline"}`}>
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-headline text-2xl md:text-4xl font-bold text-primary">{value}</span>
        {subtitle && <span className="text-xs md:text-sm text-on-surface-variant">{subtitle}</span>}
      </div>
    </div>
  );
}

function AIFeedItem({
  icon, iconBg, title, subtitle, action,
}: {
  icon: string; iconBg: string; title: string; subtitle: string; action: string;
}) {
  return (
    <div className="p-3 rounded-lg hover:bg-surface-container transition-colors duration-200 flex items-start gap-3 group border border-transparent hover:border-outline-variant">
      <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
        <span className="material-symbols-outlined text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{title}</p>
        <p className="text-xs text-on-surface-variant mt-1 font-semibold tracking-wider uppercase">{subtitle}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-surface text-on-surface border border-outline rounded text-xs font-semibold transition-all duration-200 shrink-0 hover:bg-surface-container-high active:scale-95">
        {action}
      </button>
    </div>
  );
}
