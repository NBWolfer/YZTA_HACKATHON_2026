"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { type ChatMessage, type ChatResponse, getWhatsAppHistory, getAgentLogs, type AgentLogEntry } from "./api";

export interface AgentLog {
  time: string;
  agent: string;
  color: string;
  message: string;
  detail?: string;
  level?: "info" | "warn" | "error";
}

// Color map for agent names — keeps the terminal aesthetic
const AGENT_COLORS: Record<string, string> = {
  ORCHESTRATOR: "text-primary-fixed-dim",
  WORKFLOW: "text-inverse-primary",
  CUSTOMER: "text-secondary-container",
  ORDER: "text-surface-dim",
  INVENTORY: "text-[#ffb77d]",
};

function toAgentLog(entry: AgentLogEntry): AgentLog {
  return {
    time: entry.time,
    agent: entry.agent,
    color: AGENT_COLORS[entry.agent] || "text-on-primary-container",
    message: entry.message,
    level: entry.level,
  };
}

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
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const logIndexRef = useRef(0);

  // Poll WhatsApp History with recursive setTimeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const fetchHistory = async () => {
      try {
        const data = await getWhatsAppHistory();
        setWaHistory(data.conversations || {});
      } catch (err) {
        console.error("Failed to fetch WhatsApp history", err);
      } finally {
        timeoutId = setTimeout(fetchHistory, 3000);
      }
    };
    fetchHistory();
    return () => clearTimeout(timeoutId);
  }, []);

  // Poll live agent logs from backend with recursive setTimeout
  const fetchAgentLogs = useCallback(async () => {
    try {
      const data = await getAgentLogs(logIndexRef.current);
      if (data.logs.length > 0) {
        const newLogs = data.logs.map(toAgentLog);
        setLogs((prev) => [...prev, ...newLogs]);
      }
      logIndexRef.current = data.next_index;
    } catch (err) {
      // Backend unreachable — silently skip
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const pollLogs = async () => {
      await fetchAgentLogs();
      timeoutId = setTimeout(pollLogs, 3000);
    };
    pollLogs();
    return () => clearTimeout(timeoutId);
  }, [fetchAgentLogs]);

  const contextValue = React.useMemo(() => ({
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
    logs,
  }), [messages, toolCalls, provider, waHistory, waNumber, waMessage, logs]);

  return (
    <AppContext.Provider value={contextValue}>
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
