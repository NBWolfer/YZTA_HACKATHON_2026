"use client";

import { useState, useRef, useEffect } from "react";
import { sendChat, sendWhatsAppMessage, type ChatMessage, type ChatResponse } from "@/lib/api";
import { useAppContext } from "@/lib/AppContext";

export default function CustomersPage() {
  const {
    messages, setMessages,
    toolCalls, setToolCalls,
    provider, setProvider,
    waHistory,
    waNumber, setWaNumber,
    waMessage, setWaMessage
  } = useAppContext();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WhatsApp Integration State (local UI state only)
  const [waSending, setWaSending] = useState(false);
  const [waStatus, setWaStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);



  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await sendChat(newMessages, provider);
      setMessages([...newMessages, { role: "assistant", content: res.response }]);
      setToolCalls(res.tool_calls);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(errorMsg);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Bir hata oluştu. Lütfen tekrar deneyin." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (q: string) => {
    setInput(q);
    // Optionally auto-send
  };

  const handleSendWhatsApp = async () => {
    if (!waNumber || !waMessage || waSending) return;
    setWaSending(true);
    setWaStatus(null);
    try {
      await sendWhatsAppMessage(waNumber, waMessage);
      setWaStatus({ type: 'success', text: 'Mesaj başarıyla gönderildi!' });
      setWaMessage("");
      setTimeout(() => setWaStatus(null), 3000);
    } catch (err) {
      setWaStatus({ type: 'error', text: 'Gönderim başarısız. Bot aktif mi?' });
    } finally {
      setWaSending(false);
    }
  };

  return (
    <div className="h-full flex gap-4 lg:gap-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Chat List (left) — hidden on mobile */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
          <h3 className="font-headline text-lg font-semibold">Mesajlar</h3>
          <button className="text-secondary p-1 hover:bg-secondary-container rounded-full transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Active conversation indicator */}
          <div className="p-4 border-b border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer flex gap-3 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-semibold shrink-0">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-on-surface truncate">AI Copilot Chat</h4>
                <span className="text-surface-tint text-xs">Şimdi</span>
              </div>
              <p className="text-sm text-on-surface-variant truncate">
                {messages.length > 0
                  ? messages[messages.length - 1].content.slice(0, 40) + "..."
                  : "Aktif konuşma"}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold mt-1">
                <span className="material-symbols-outlined text-[12px] mr-1">smart_toy</span>
                Gemma 4 E2B
              </span>
            </div>
          </div>

          {/* Incoming WhatsApp Messages Header */}
          {Object.keys(waHistory).length > 0 && (
            <div className="p-3 bg-surface-bright border-b border-outline-variant sticky top-0 z-10 shadow-sm">
              <h4 className="text-xs font-semibold uppercase text-secondary tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">forum</span>
                WhatsApp Mesajları
              </h4>
            </div>
          )}

          {/* Incoming WhatsApp Conversations */}
          {Object.entries(waHistory).map(([phone, msgs]) => {
            const lastMsg = msgs[msgs.length - 1];
            return (
              <div key={phone} className="p-4 border-b border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors flex gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-semibold shrink-0">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-on-surface text-sm truncate">{phone}</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    {lastMsg?.role === "assistant" ? "AI: " : ""}{lastMsg?.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </aside>

      {/* Main Chat Window (center) */}
      <section className="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm min-w-0">
        {/* Chat Header */}
        <div className="p-3 md:p-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined fill-icon">smart_toy</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold">Customer Hub</h3>
              <p className="text-xs text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                {provider === "ollama" ? "Gemma 4 ile çalışıyor" : "Groq ile çalışıyor"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Provider Toggle */}
            <div className="hidden md:flex bg-surface-container-high rounded-lg p-1">
              <button
                onClick={() => setProvider("ollama")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${provider === "ollama" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Local (Ollama)
              </button>
              <button
                onClick={() => setProvider("groq")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${provider === "groq" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Groq API
              </button>
            </div>
            
            {/* Mobile tool calls toggle */}
          <button
            onClick={() => setShowTools(!showTools)}
            className="lg:hidden p-2 hover:bg-surface-container-high rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined text-primary">psychology</span>
            {toolCalls.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-on-secondary rounded-full text-[10px] flex items-center justify-center font-bold">
                {toolCalls.length}
              </span>
            )}
          </button>
          </div>
        </div>

        {/* WhatsApp Quick Integration Panel */}
        <div className="p-3 md:p-4 border-b border-outline-variant bg-surface-container-lowest">
          <h4 className="font-headline font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-secondary text-[18px]">send_to_mobile</span>
            Müşteriye Doğrudan WhatsApp Mesajı
          </h4>
          <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
            <input 
              type="text" 
              placeholder="Tel No (Örn: 905xxxxxxxxx)" 
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              className="w-full md:w-48 bg-surface-container-low border border-outline-variant rounded-lg p-2 text-sm outline-none focus:border-secondary"
            />
            <input 
              type="text"
              placeholder="Gönderilecek mesaj..." 
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              className="flex-1 w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-sm outline-none focus:border-secondary"
              onKeyDown={(e) => e.key === "Enter" && handleSendWhatsApp()}
            />
            <button 
              onClick={handleSendWhatsApp}
              disabled={waSending || !waNumber || !waMessage}
              className={`w-full md:w-auto px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${waSending || !waNumber || !waMessage ? 'bg-surface-container-high text-outline cursor-not-allowed' : 'bg-secondary text-on-secondary hover:bg-secondary/90'}`}
            >
              {waSending ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
          {waStatus && (
            <p className={`text-xs mt-2 ${waStatus.type === 'error' ? 'text-error' : 'text-secondary font-medium'}`}>
              {waStatus.text}
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-surface flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center animate-fade-in">
              <div className="max-w-md">
                <span className="material-symbols-outlined text-5xl md:text-6xl text-secondary-container mb-4">forum</span>
                <h3 className="font-headline text-lg font-semibold text-primary mb-2">
                  Müşteri İletişim Merkezi
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Sipariş durumu sorgula, stok bilgisi al, yeni sipariş oluştur.
                  AI asistanınız tüm araçlara erişebilir.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    "128 numaralı siparişim nerede?",
                    "Lavanta sabunu stokta var mı?",
                    "Bugünkü siparişleri özetle",
                    "Stok uyarılarını göster",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestion(q)}
                      className="px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-xs text-on-surface hover:bg-surface-container-high hover:border-secondary transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-start" : "justify-end self-end"} max-w-[90%] md:max-w-[80%] animate-fade-in`}
            >
              <div
                className={`rounded-2xl p-3 md:p-4 shadow-sm ${
                  m.role === "user"
                    ? "bg-surface-container-lowest border border-outline-variant rounded-tl-sm"
                    : "bg-secondary-container/20 border border-secondary/30 rounded-tr-sm relative"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="absolute -top-3 -right-2 bg-surface-container-lowest border border-secondary text-secondary rounded-full p-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-end self-end max-w-[80%] animate-fade-in">
              <div className="bg-secondary-container/20 border border-secondary/30 rounded-2xl rounded-tr-sm p-4">
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                  <span className="text-sm">Düşünüyor...</span>
                </div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex justify-center animate-fade-in">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-error-container/30 border border-error/20 rounded-lg text-xs text-on-error-container">
                <span className="material-symbols-outlined text-sm">error</span>
                Bağlantı hatası: {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 md:p-4 bg-surface-bright border-t border-outline-variant">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all duration-200">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Mesajınızı yazın..."
                className="w-full bg-transparent border-none focus:ring-0 p-3 text-sm outline-none"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`p-3 rounded-xl shrink-0 transition-all duration-200 active:scale-95 ${
                input.trim() && !loading
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "bg-surface-container-high text-outline cursor-not-allowed"
              }`}
            >
              <span className="material-symbols-outlined fill-icon">send</span>
            </button>
          </div>
        </div>
      </section>

      {/* Right Sidebar — Tool Call Log */}
      {/* Desktop: always visible; Mobile: overlay */}
      <aside
        className={`${
          showTools
            ? "fixed inset-0 z-50 flex items-end lg:items-stretch lg:relative lg:inset-auto lg:z-auto"
            : "hidden lg:flex"
        } lg:w-72 shrink-0 flex-col gap-4 overflow-y-auto`}
      >
        {/* Mobile backdrop */}
        {showTools && (
          <div
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm lg:hidden"
            onClick={() => setShowTools(false)}
          />
        )}
        <div className={`${showTools ? "relative w-full max-h-[60vh] bg-surface-container rounded-t-2xl p-4 lg:p-0 lg:max-h-none lg:bg-transparent lg:rounded-none animate-slide-up" : ""} flex flex-col gap-4`}>
          {showTools && (
            <div className="flex justify-between items-center lg:hidden mb-2">
              <h4 className="font-headline font-semibold text-primary">AI Araç Kullanımı</h4>
              <button onClick={() => setShowTools(false)} className="p-1 hover:bg-surface-container-high rounded-full">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
          )}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none" />
            <h4 className="hidden lg:flex text-xs font-semibold tracking-wider uppercase text-surface-tint items-center gap-1 mb-3">
              <span className="material-symbols-outlined text-[16px] text-secondary">psychology</span>
              AI Araç Kullanımı
            </h4>
            {toolCalls.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Henüz araç çağrısı yapılmadı. Sohbet başladığında burada agent&apos;ın kullandığı araçları göreceksiniz.
              </p>
            ) : (
              <div className="space-y-3">
                {toolCalls.map((tc, i) => (
                  <div key={i} className="bg-surface-container-low border border-outline-variant rounded-lg p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-secondary text-[14px]">build</span>
                      <span className="text-xs font-semibold text-primary">{tc.tool}</span>
                    </div>
                    <pre className="text-[10px] text-on-surface-variant bg-surface-container p-2 rounded overflow-x-auto">
                      {JSON.stringify(tc.args, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
