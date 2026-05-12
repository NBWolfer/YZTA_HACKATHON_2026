"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type ChatMessage, type ChatResponse, getWhatsAppHistory } from "./api";

export interface AgentLog {
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

interface AppContextProps {
  // Chat State
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  toolCalls: ChatResponse["tool_calls"];
  setToolCalls: React.Dispatch<React.SetStateAction<ChatResponse["tool_calls"]>>;
  provider: "ollama" | "groq";
  setProvider: React.Dispatch<React.SetStateAction<"ollama" | "groq">>;
  
  // WhatsApp State
  waHistory: Record<string, ChatMessage[]>;
  waNumber: string;
  setWaNumber: React.Dispatch<React.SetStateAction<string>>;
  waMessage: string;
  setWaMessage: React.Dispatch<React.SetStateAction<string>>;

  // Dashboard / Agents State
  systemUptime: number;
  logs: AgentLog[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toolCalls, setToolCalls] = useState<ChatResponse["tool_calls"]>([]);
  const [provider, setProvider] = useState<"ollama" | "groq">("ollama");

  // WhatsApp State
  const [waHistory, setWaHistory] = useState<Record<string, ChatMessage[]>>({});
  const [waNumber, setWaNumber] = useState("");
  const [waMessage, setWaMessage] = useState("");

  // Agents State
  const [systemUptime, setSystemUptime] = useState(0);
  const [logs, setLogs] = useState<AgentLog[]>(INITIAL_LOGS);

  // Poll WhatsApp History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getWhatsAppHistory();
        setWaHistory(data.conversations || {});
      } catch (err) {
        console.error("Failed to fetch WhatsApp history", err);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  // System Uptime Timer
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

  return (
    <AppContext.Provider
      value={{
        messages,
        setMessages,
        toolCalls,
        setToolCalls,
        provider,
        setProvider,
        waHistory,
        waNumber,
        setWaNumber,
        waMessage,
        setWaMessage,
        systemUptime,
        logs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
