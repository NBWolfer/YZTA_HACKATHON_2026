"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

const WA_BOT_URL = "http://localhost:3001";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [waQR, setWaQR] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState<"idle" | "scanning" | "authenticated" | "error">("idle");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/login");
    }
  }, [router]);

  // Poll WhatsApp bot for QR / status when connecting
  useEffect(() => {
    if (connecting !== "whatsapp") return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${WA_BOT_URL}/api/qr`);
        if (!res.ok) throw new Error("Bot unreachable");
        const data = await res.json();

        if (cancelled) return;

        if (data.authenticated || data.ready) {
          setWaStatus("authenticated");
          setConnecting(null);
          if (!connected.includes("whatsapp")) {
            setConnected((prev) => [...prev, "whatsapp"]);
          }
          setWaQR(null);
          return; // Stop polling
        }

        if (data.qr) {
          setWaQR(data.qr);
          setWaStatus("scanning");
        }
      } catch {
        if (!cancelled) setWaStatus("error");
      }
    };

    poll();
    const interval = setInterval(poll, 2500);
    return () => { cancelled = true; clearInterval(interval); };
  }, [connecting, connected]);

  const handleConnect = (platform: string) => {
    if (platform === "whatsapp") {
      setConnecting("whatsapp");
      setWaStatus("idle");
      setWaQR(null);
    } else {
      // Other integrations: simulate connection
      setConnecting(platform);
      setTimeout(() => {
        setConnecting(null);
        if (!connected.includes(platform)) {
          setConnected([...connected, platform]);
        }
      }, 1500);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-container-lowest">
      <div className="w-full max-w-3xl bg-surface-bright border border-outline-variant rounded-2xl shadow-xl overflow-hidden animate-slide-up flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Sidebar - Progress */}
        <div className="w-full md:w-1/3 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px]">hub</span>
            </div>
            <h1 className="font-headline font-bold text-primary">SME Orchestrator</h1>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <StepIndicator current={step} number={1} title="Hoş Geldiniz" desc="Sisteme giriş" />
            <StepIndicator current={step} number={2} title="Veri Kaynakları" desc="Sistemlerinizi bağlayın" />
            <StepIndicator current={step} number={3} title="Yapay Zeka" desc="Ajan yetkilendirmesi" />
            <StepIndicator current={step} number={4} title="Tamamlanıyor" desc="Hazırsınız" />
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col relative overflow-hidden">
          
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center animate-fade-in">
              <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">waving_hand</span>
              </div>
              <h2 className="text-2xl font-bold font-headline mb-2">Hoş geldiniz, {user.name.split(' ')[0]}!</h2>
              <p className="text-on-surface-variant mb-6">
                Kooperatifinizin ve işletmenizin yapay zeka destekli operasyon merkezine adım attınız. Bırakın manuel, tekrar eden operasyonel işleri biz yapalım, siz sadece üretmeye ve büyümeye odaklanın.
              </p>
              <p className="text-on-surface-variant text-sm mb-8">
                Şimdi 3 kısa adımla sisteminizi işletmenize özel hale getirelim.
              </p>
              <div className="mt-auto flex justify-end">
                <button onClick={nextStep} className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                  Başlayalım <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Connections */}
          {step === 2 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <h2 className="text-xl font-bold font-headline mb-2">Veri Kaynaklarınızı Bağlayın</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                SME Orchestrator'ın sizin için çalışabilmesi için halihazırda kullandığınız kanalları sisteme entegre etmeniz gerekiyor. Güvenli bağlantı altyapımızla verileriniz koruma altındadır.
              </p>
              
              <div className="flex flex-col gap-3 mb-6 flex-1 overflow-y-auto pr-2">
                {/* WhatsApp card with QR code support */}
                <WhatsAppIntegrationCard 
                  connected={connected}
                  connecting={connecting}
                  onConnect={handleConnect}
                  qrCode={waQR}
                  status={waStatus}
                />
                <IntegrationCard 
                  id="cargo"
                  icon="local_shipping"
                  color="bg-tertiary text-on-tertiary"
                  title="Kargo Firmaları (Yurtiçi/Aras/MNG)"
                  desc="Siparişlerin hazırlanıyor, kargoda ve teslim edildi durumlarını anlık takip etmek için."
                  connected={connected} connecting={connecting} onConnect={handleConnect}
                />
                <IntegrationCard 
                  id="erp"
                  icon="inventory_2"
                  color="bg-primary text-on-primary"
                  title="Stok & Envanter (Excel / ERP)"
                  desc="Stok seviyelerini anlık analiz edip uyarı vermek için."
                  connected={connected} connecting={connecting} onConnect={handleConnect}
                />
              </div>

              <div className="mt-auto flex justify-between items-center pt-4 border-t border-outline-variant">
                <button onClick={() => setStep(1)} className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-container rounded-xl transition-colors">
                  Geri
                </button>
                <div className="flex items-center gap-3">
                  {connected.length === 0 && <span className="text-xs text-outline italic">Şimdilik atlayabilirsiniz</span>}
                  <button onClick={nextStep} className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                    Devam Et <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: AI Configuration */}
          {step === 3 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <h2 className="text-xl font-bold font-headline mb-2">Yapay Zeka Asistanı Yetkileri</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                İşletmenizin yapay zeka ajanlarına (agent) hangi görevlerde otonomi vermek istediğinizi seçin. Bu ayarları daha sonra panelinizden değiştirebilirsiniz.
              </p>
              
              <div className="flex flex-col gap-4 mb-6 flex-1">
                <label className="flex items-start gap-3 p-3 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded" />
                  <div>
                    <h4 className="font-semibold text-sm">Müşteri İletişimi Otomasyonu</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">WhatsApp'tan gelen "Siparişim nerede?" veya stok durumu sorularına 7/24 otomatik, doğal dille yanıt ver.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded" />
                  <div>
                    <h4 className="font-semibold text-sm">Proaktif Stok Yönetimi</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Domates vb. kritik ürün stoğu belirlediğim eşiğin altına düştüğünde beni uyar ve tedarikçiye e-posta taslağı hazırla.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded" />
                  <div>
                    <h4 className="font-semibold text-sm">Günlük İş Akışı Özeti</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Her sabah 08:00'de dünün sipariş özetini ve depo için hazırlanması gereken paketleme listesini gönder.</p>
                  </div>
                </label>
              </div>

              <div className="mt-auto flex justify-between items-center pt-4 border-t border-outline-variant">
                <button onClick={() => setStep(2)} className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-container rounded-xl transition-colors">
                  Geri
                </button>
                <button onClick={nextStep} className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                  Yetkileri Kaydet <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="flex-1 flex flex-col justify-center items-center text-center animate-slide-up">
              <div className="relative">
                <div className="w-20 h-20 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mb-6 shadow-lg z-10 relative">
                  <span className="material-symbols-outlined text-4xl">check</span>
                </div>
                {/* Background pulse effect */}
                <div className="absolute inset-0 bg-secondary-container rounded-full animate-ping opacity-50"></div>
              </div>
              <h2 className="text-2xl font-bold font-headline mb-2">Her Şey Hazır!</h2>
              <p className="text-on-surface-variant mb-8 max-w-sm">
                SME Orchestrator başarıyla yapılandırıldı. Arka planda verileriniz eşitleniyor. Artık işlerinizi yönetmek için panele geçebilirsiniz.
              </p>
              <button onClick={nextStep} className="px-8 py-3 bg-secondary text-on-secondary font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md">
                Dashboard'a Git
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current, number, title, desc }: { current: number, number: number, title: string, desc: string }) {
  const isPast = current > number;
  const isCurrent = current === number;
  
  return (
    <div className={`flex gap-3 ${isPast || isCurrent ? "opacity-100" : "opacity-40"} transition-opacity duration-300`}>
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
          isPast ? "bg-secondary text-on-secondary" : 
          isCurrent ? "bg-primary text-on-primary ring-4 ring-primary-container" : 
          "bg-surface-container-high text-on-surface"
        }`}>
          {isPast ? <span className="material-symbols-outlined text-[18px]">check</span> : number}
        </div>
        {number < 4 && (
          <div className={`w-0.5 h-10 mt-2 rounded-full transition-colors duration-300 ${isPast ? "bg-secondary" : "bg-surface-container-high"}`}></div>
        )}
      </div>
      <div className="mt-1">
        <h3 className={`text-sm font-bold ${isCurrent ? "text-primary" : "text-on-surface"}`}>{title}</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

/** WhatsApp integration card with QR code rendering */
function WhatsAppIntegrationCard({ 
  connected, connecting, onConnect, qrCode, status
}: { 
  connected: string[], connecting: string | null, onConnect: (id: string) => void,
  qrCode: string | null, status: "idle" | "scanning" | "authenticated" | "error"
}) {
  const isConnected = connected.includes("whatsapp");
  const isConnecting = connecting === "whatsapp";
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  // Render QR code to data URL using local qrcode package
  useEffect(() => {
    if (!qrCode) { setQrImageUrl(null); return; }
    QRCode.toDataURL(qrCode, { width: 200, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then((url: string) => setQrImageUrl(url))
      .catch(() => setQrImageUrl(null));
  }, [qrCode]);

  return (
    <div className={`border rounded-xl transition-colors duration-300 ${
      isConnected ? "bg-secondary-container/20 border-secondary" : "bg-surface-container-lowest border-outline-variant"
    }`}>
      {/* Header row */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#25D366] text-white">
          <span className="material-symbols-outlined">forum</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">WhatsApp Business</h4>
          <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">Müşteri mesajlarını otomatik yanıtlamak için.</p>
        </div>
        <button 
          onClick={() => !isConnected && !isConnecting && onConnect("whatsapp")}
          disabled={isConnected || isConnecting}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
            isConnected ? "bg-transparent text-secondary flex items-center gap-1" :
            isConnecting ? "bg-surface-container-high text-on-surface opacity-70" :
            "bg-surface-container text-on-surface hover:bg-surface-container-high"
          }`}
        >
          {isConnected ? (
            <><span className="material-symbols-outlined text-[14px]">check_circle</span> Bağlı</>
          ) : isConnecting ? (
            <span className="w-4 h-4 border-2 border-on-surface border-t-transparent rounded-full animate-spin block"></span>
          ) : (
            "Bağla"
          )}
        </button>
      </div>

      {/* QR Code panel — shown when connecting */}
      {isConnecting && (
        <div className="px-3 pb-3 animate-fade-in">
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 flex flex-col items-center gap-3">
            {status === "error" ? (
              <div className="text-center py-4">
                <span className="material-symbols-outlined text-3xl text-error mb-2">error</span>
                <p className="text-sm text-error font-semibold">WhatsApp Bot'a bağlanılamıyor</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Bot servisinin <code className="bg-surface-container px-1 rounded">localhost:3001</code> adresinde çalıştığından emin olun.
                </p>
                <button 
                  onClick={() => onConnect("whatsapp")}
                  className="mt-3 px-4 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : qrCode && qrImageUrl ? (
              <>
                <p className="text-xs text-on-surface-variant font-semibold text-center">
                  WhatsApp uygulamanızdan bu QR kodu tarayın
                </p>
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <img src={qrImageUrl} alt="WhatsApp QR Code" width={200} height={200} className="block" />
                </div>
                <p className="text-[11px] text-outline text-center">
                  WhatsApp → Ayarlar → Bağlı Cihazlar → Cihaz Bağla
                </p>
              </>
            ) : (
              <div className="py-4 flex flex-col items-center gap-2">
                <span className="w-6 h-6 border-2 border-outline-variant border-t-secondary rounded-full animate-spin block"></span>
                <p className="text-xs text-on-surface-variant">Bot'a bağlanılıyor...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationCard({ 
  id, icon, color, title, desc, connected, connecting, onConnect 
}: { 
  id: string, icon: string, color: string, title: string, desc: string, 
  connected: string[], connecting: string | null, onConnect: (id: string) => void 
}) {
  const isConnected = connected.includes(id);
  const isConnecting = connecting === id;

  return (
    <div className={`p-3 border rounded-xl flex items-center gap-3 transition-colors duration-300 ${
      isConnected ? "bg-secondary-container/20 border-secondary" : "bg-surface-container-lowest border-outline-variant"
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate">{title}</h4>
        <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">{desc}</p>
      </div>
      <button 
        onClick={() => !isConnected && !isConnecting && onConnect(id)}
        disabled={isConnected || isConnecting}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
          isConnected ? "bg-transparent text-secondary flex items-center gap-1" :
          isConnecting ? "bg-surface-container-high text-on-surface opacity-70" :
          "bg-surface-container text-on-surface hover:bg-surface-container-high"
        }`}
      >
        {isConnected ? (
          <><span className="material-symbols-outlined text-[14px]">check_circle</span> Bağlı</>
        ) : isConnecting ? (
          <span className="w-4 h-4 border-2 border-on-surface border-t-transparent rounded-full animate-spin block"></span>
        ) : (
          "Bağla"
        )}
      </button>
    </div>
  );
}
