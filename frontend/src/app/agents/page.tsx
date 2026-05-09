"use client";

import { useEffect, useState, useCallback } from "react";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api";

interface AgentLog {
  time: string;
  agent: string;
  color: string;
  message: string;
  detail?: string;
  level?: "info" | "warn" | "error";
}

const INITIAL_LOGS: AgentLog[] = [
  { time: "10:42:01.005", agent: "ORCHESTRATOR", color: "text-primary-fixed-dim", message: "System check OK. 4 agents registered." },
  { time: "10:42:15.221", agent: "WORKFLOW", color: "text-inverse-primary", message: "Inbound webhook received from API_GW." },
  { time: "10:42:15.225", agent: "CUSTOMER", color: "text-secondary-container", message: "Answering query for #104 via WhatsApp." },
  { time: "10:42:16.100", agent: "ORDER", color: "text-surface-dim", message: "Fetching details for Order #104. Status: IN_TRANSIT (Yurtiçi)." },
  { time: "10:42:17.550", agent: "CUSTOMER", color: "text-secondary-container", message: "Generating Turkish response. Dispatching to chat UI..." },
];

export default function AgentsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>(INITIAL_LOGS);
  const [systemUptime, setSystemUptime] = useState(0);

  // Check backend health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.BACKEND_URL || "http://localhost:8000"}/health`);
      setHealthOk(res.ok);
    } catch {
      setHealthOk(false);
    }
  }, []);

  // Fetch dashboard data for live stats
  useEffect(() => {
    checkHealth();
    getDashboardSummary().then(setSummary).catch(() => setSummary(null));
  }, [checkHealth]);

  // Simulated uptime counter
  useEffect(() => {
    const t = setInterval(() => setSystemUptime((u) => u + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate live log entries
  useEffect(() => {
    const liveMessages: AgentLog[] = [
      { time: "", agent: "INVENTORY", color: "text-[#ffb77d]", message: "Stock reconciliation pass complete. 3 items flagged.", level: "warn" },
      { time: "", agent: "ORCHESTRATOR", color: "text-primary-fixed-dim", message: "Heartbeat OK. All agents responsive." },
      { time: "", agent: "WORKFLOW", color: "text-inverse-primary", message: "Daily briefing scheduled for 08:00 UTC+3." },
      { time: "", agent: "ORDER", color: "text-surface-dim", message: "Aras Kargo route optimization queued." },
      { time: "", agent: "CUSTOMER", color: "text-secondary-container", message: "Idle. Waiting for inbound queries." },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= liveMessages.length) { clearInterval(interval); return; }
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
      setLogs((prev) => [...prev, { ...liveMessages[idx], time: timeStr }]);
      idx++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col gap-4 md:gap-6 animate-fade-in">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 stagger-children">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 md:p-4 elevation-1 flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
            <span className="material-symbols-outlined fill-icon">memory</span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] md:text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Core Engine</div>
            <div className="font-headline text-base md:text-lg font-semibold text-primary flex items-center gap-1">
              Gemma 4
              <span className={`w-2 h-2 rounded-full inline-block ${healthOk === true ? "bg-secondary animate-pulse-dot" : healthOk === false ? "bg-error" : "bg-outline"}`} />
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 md:p-4 elevation-1 flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">schema</span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] md:text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Active Model</div>
            <div className="font-headline text-base md:text-lg font-semibold text-primary">E2B Instance</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 md:p-4 elevation-1 flex flex-col justify-center col-span-1">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] md:text-xs font-semibold tracking-wider uppercase text-on-surface-variant">VRAM (4GB)</span>
            <span className="font-mono text-xs text-secondary">~2.8 GB</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: "70%" }} />
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 md:p-4 elevation-1 flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">timer</span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] md:text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Uptime</div>
            <div className="font-mono text-base md:text-lg font-semibold text-primary">{formatUptime(systemUptime)}</div>
          </div>
        </div>
      </div>

      {/* Live Stats from API */}
      {summary && (
        <div className="grid grid-cols-3 gap-3 md:gap-4 stagger-children">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">shopping_cart</span>
            <div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">Bugünkü Siparişler</div>
              <div className="font-headline text-xl font-bold text-primary">{summary.todays_orders}</div>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">local_shipping</span>
            <div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">Aktif Teslimat</div>
              <div className="font-headline text-xl font-bold text-primary">{summary.active_deliveries}</div>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-error">warning</span>
            <div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">Stok Uyarısı</div>
              <div className="font-headline text-xl font-bold text-error">{summary.low_stock_alerts}</div>
            </div>
          </div>
        </div>
      )}

      {/* Swarm + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Swarm Topology */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-8 elevation-1 flex flex-col h-[300px] md:h-[400px] animate-slide-up">
          <h2 className="font-headline text-base md:text-lg font-semibold text-primary mb-4">Swarm Topology</h2>
          <div className="flex-1 relative border border-surface-container-highest rounded-lg bg-surface-bright overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#091426 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ stroke: "#c5c6cd", strokeWidth: 2, strokeDasharray: "4 4" }}>
              <line x1="50%" y1="50%" x2="20%" y2="25%" />
              <line x1="50%" y1="50%" x2="80%" y2="25%" />
              <line x1="50%" y1="50%" x2="20%" y2="75%" />
              <line x1="50%" y1="50%" x2="80%" y2="75%" />
            </svg>
            {/* Center: Orchestrator */}
            <AgentNode position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" icon="device_hub" label="Orchestrator" variant="primary" health={healthOk} />
            {/* Corners */}
            <AgentNode position="top-[20%] left-[15%]" icon="account_tree" label="Workflow" />
            <AgentNode position="top-[20%] right-[15%]" icon="support_agent" label="Customer" variant="active" />
            <AgentNode position="top-[70%] left-[15%]" icon="inventory_2" label="Inventory" variant="active" />
            <AgentNode position="top-[70%] right-[15%]" icon="local_shipping" label="Order" />
          </div>
        </div>

        {/* Active Tasks */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 elevation-1 flex flex-col h-[300px] md:h-[400px] animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-base md:text-lg font-semibold text-primary">Aktif Görevler</h2>
            <span className="font-mono text-xs bg-surface-container-high px-2 py-1 rounded text-on-surface-variant">3 Çalışıyor</span>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto">
            <TaskItem name="Stok Uzlaştırma" agent="Inventory" progress={85} icon="sync" />
            <TaskItem name="WhatsApp Sorgu #104" agent="Customer" progress={-1} icon="autorenew" />
            <TaskItem name="Aras Kargo Rota Oluşturma" agent="Order" progress={0} icon="route" status="Sırada" />
          </div>
        </div>
      </div>

      {/* Agent Activity Log */}
      <div className="bg-primary-container border border-outline-variant rounded-xl overflow-hidden elevation-1 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="bg-primary-container px-4 py-3 flex justify-between items-center border-b border-primary-container/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-primary text-sm">terminal</span>
            <h3 className="text-xs font-bold text-on-primary tracking-wider uppercase">Agent Aktivite Logu</h3>
          </div>
          <div className="flex items-center gap-3">
            {healthOk !== null && (
              <span className={`text-[10px] font-mono ${healthOk ? "text-secondary" : "text-error"}`}>
                {healthOk ? "● CONNECTED" : "● DISCONNECTED"}
              </span>
            )}
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-error/80 border border-error" />
              <span className="w-3 h-3 rounded-full bg-[#FEF3C7]/80 border border-[#D97705]" />
              <span className="w-3 h-3 rounded-full bg-secondary/80 border border-secondary-container" />
            </div>
          </div>
        </div>
        <div className="p-3 md:p-4 bg-[#0f172a] h-48 md:h-64 overflow-y-auto font-mono text-xs md:text-sm flex flex-col gap-1 scroll-smooth" id="agent-log">
          {logs.map((log, i) => (
            <div key={i} className="text-on-primary-container animate-fade-in">
              <span className="text-outline mr-2 md:mr-4">[{log.time}]</span>
              <span className={`${log.color} font-bold`}>[{log.agent}]</span>
              {log.level === "warn" && (
                <span className="bg-[#422000] text-[#ffb77d] px-1 mx-1 text-[10px]">WARN</span>
              )}
              {log.level === "error" && (
                <span className="bg-error/30 text-error px-1 mx-1 text-[10px]">ERROR</span>
              )}
              {" "}{log.message}
            </div>
          ))}
          <div className="text-on-primary-container mt-1 flex items-center">
            <span className="text-outline mr-2 md:mr-4">[{new Date().toLocaleTimeString("tr-TR", { hour12: false })}]</span>
            <span className="w-2 h-4 bg-secondary animate-pulse inline-block" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentNode({ position, icon, label, variant, health }: { position: string; icon: string; label: string; variant?: "primary" | "active"; health?: boolean | null }) {
  const base = variant === "primary"
    ? "w-14 h-14 md:w-16 md:h-16 bg-primary-container text-on-primary border-2 border-secondary ai-glow elevation-2"
    : variant === "active"
    ? "w-10 h-10 md:w-12 md:h-12 bg-secondary-container text-on-secondary-container border border-secondary ai-glow shadow-sm"
    : "w-10 h-10 md:w-12 md:h-12 bg-surface-container text-on-surface-variant border border-outline-variant hover:border-secondary";

  return (
    <div className={`absolute ${position} flex flex-col items-center gap-1 z-10`}>
      <div className={`rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${base}`}>
        <span className={`material-symbols-outlined ${variant ? "fill-icon" : ""} ${variant === "primary" ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}>{icon}</span>
      </div>
      <span className={`text-[10px] md:text-xs font-semibold bg-surface px-1.5 md:px-2 py-0.5 rounded border whitespace-nowrap ${variant === "active" ? "border-secondary text-secondary font-bold" : "border-outline-variant text-on-surface-variant"}`}>
        {label}
        {variant === "primary" && health !== null && (
          <span className={`ml-1 inline-block w-1.5 h-1.5 rounded-full ${health ? "bg-secondary" : "bg-error"}`} />
        )}
      </span>
    </div>
  );
}

function TaskItem({ name, agent, progress, icon, status }: { name: string; agent: string; progress: number; icon: string; status?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`material-symbols-outlined text-sm shrink-0 ${progress > 0 ? "text-secondary" : progress < 0 ? "text-secondary animate-spin" : "text-outline"}`}>{icon}</span>
          <span className="text-sm font-medium text-primary truncate">{name}</span>
        </div>
        <span className="font-mono text-xs text-on-surface-variant shrink-0 ml-2">{status ?? (progress >= 0 ? `%${progress}` : "İşleniyor")}</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${progress > 0 ? "bg-secondary" : progress < 0 ? "bg-secondary w-1/3 animate-pulse" : "bg-outline-variant"}`}
          style={progress >= 0 ? { width: `${progress}%` } : undefined}
        />
      </div>
      <div className="text-xs text-on-surface-variant opacity-70">Agent: {agent}</div>
    </div>
  );
}
