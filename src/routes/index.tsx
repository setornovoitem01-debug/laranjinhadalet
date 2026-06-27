import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  MoreVertical,
  Images,
  Film,
  Lock,
  Heart,
  BadgeCheck,
  Smartphone,
  ChevronUp,
  MessageCircle,
  DollarSign,
  Bookmark,
  Image as ImageIcon,
  LogIn,
  UserPlus,
  EyeOff,
  ChevronRight,
  Globe,
  Check,
  Copy,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import profileAsset from "@/assets/profile.png.asset.json";
import coverAsset from "@/assets/cover.png.asset.json";
import privacyLogoAsset from "@/assets/privacy-logo.png.asset.json";
import { createPixPayment } from "@/lib/pix.functions";
import { getPaymentStatus } from "@/lib/payment-status.functions";


const PROFILE_IMG = profileAsset.url;
const COVER_IMG = coverAsset.url;
const DISPLAY_NAME = "leticia";
const HANDLE = "lettvargas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "@lettvargas" },
      { name: "description", content: "Página de perfil de demonstração." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("ageConfirmed") === "1") {
        setAgeConfirmed(true);
      }
    } catch {}
  }, []);
  const [promosOpen, setPromosOpen] = useState(true);
  const [tab, setTab] = useState<"posts" | "media">("posts");
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"menu" | "signin" | "signup" | "anon">("menu");
  const [selectedPlan, setSelectedPlan] = useState<{ label: string; price: string }>({
    label: "1 mês",
    price: "R$ 15,99",
  });
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixQr, setPixQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const navigate = useNavigate();
  const createPix = useServerFn(createPixPayment);
  const checkStatus = useServerFn(getPaymentStatus);

  useEffect(() => {
    if (!paymentId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await checkStatus({ data: { paymentId } });
        if (cancelled) return;
        if (r.status === "paid") {
          navigate({ to: "/obrigado" });
        }
      } catch {
        /* noop */
      }
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [paymentId, checkStatus, navigate]);

  // Back-redirect / oferta especial
  const customerRef = useRef<Record<string, string>>({});
  const [backOfferOpen, setBackOfferOpen] = useState(false);
  const [backOfferShown, setBackOfferShown] = useState(false);
  const [offerSecondsLeft, setOfferSecondsLeft] = useState(180);
  const [offerPixLoading, setOfferPixLoading] = useState(false);
  const [offerPixError, setOfferPixError] = useState<string | null>(null);
  const [offerPixCode, setOfferPixCode] = useState<string | null>(null);
  const [offerCopied, setOfferCopied] = useState(false);

  const OFFER_PRICE_LABEL = "R$ 9,90";
  const OFFER_AMOUNT = 9.9;

  useEffect(() => {
    if (!backOfferOpen) return;
    if (offerSecondsLeft <= 0) return;
    const t = setInterval(() => setOfferSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [backOfferOpen, offerSecondsLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    return `${m}:${r}`;
  };

  const tryLeaveCheckout = (onConfirmLeave: () => void) => {
    if (checkoutMode && !backOfferShown) {
      setBackOfferShown(true);
      setOfferSecondsLeft(180);
      setOfferPixCode(null);
      setOfferPixError(null);
      setBackOfferOpen(true);
    } else {
      onConfirmLeave();
    }
  };

  const exitCheckout = () => {
    setCheckoutMode(false);
    setPixCode(null);
    setPixQr(null);
    setPixError(null);
    setBackOfferOpen(false);
    setBackOfferShown(false);
  };

  const acceptOffer = async () => {
    if (offerSecondsLeft <= 0) return;
    setOfferPixLoading(true);
    setOfferPixError(null);
    setOfferPixCode(null);
    try {
      const v = customerRef.current;
      const res = await createPix({
        data: {
          amount: OFFER_AMOUNT,
          description: `Oferta especial vitalícia + chamada 10min — @${HANDLE}`,
          customerEmail: v.email || "anonimo@example.com",
          customerName: v.name,
          customerDocument: v.cpf,
          productId: "back-offer-vitalicio",
          tracking: getTracking(),
        },
      });
      if (!res.ok || !res.pixCopyPaste) {
        setOfferPixError(res.error || "Não foi possível gerar o Pix.");
      } else {
        setOfferPixCode(res.pixCopyPaste);
        if (res.id) setPaymentId(res.id);
      }
    } catch {
      setOfferPixError("Erro inesperado ao gerar o Pix.");
    } finally {
      setOfferPixLoading(false);
    }
  };

  const copyOfferPix = async () => {
    if (!offerPixCode) return;
    try {
      await navigator.clipboard.writeText(offerPixCode);
      setOfferCopied(true);
      setTimeout(() => setOfferCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  // Captura UTMs / src / sck da URL e persiste em localStorage (cross-page)
  const TRACK_KEYS = ["src", "sck", "utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term"] as const;
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      const existing = JSON.parse(localStorage.getItem("__tracking") || "{}") as Record<string, string>;
      let changed = false;
      for (const k of TRACK_KEYS) {
        const v = url.searchParams.get(k);
        if (v) {
          existing[k] = v;
          changed = true;
        }
      }
      if (changed) localStorage.setItem("__tracking", JSON.stringify(existing));
    } catch {
      /* noop */
    }
  }, []);

  const getTracking = (): Record<string, string | null> => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("__tracking") || "{}") as Record<string, string | null>;
    } catch {
      return {};
    }
  };

  // Best-effort: dispara um evento "InitiateCheckout" pra qualquer pixel escutando window/dataLayer.
  // (Utmify só rastreia vendas via API; o evento abaixo é pra Pixel do Facebook caso seja instalado.)
  const fireInitiateCheckout = (label: string, priceCents: number) => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      fbq?: (...args: unknown[]) => void;
      dataLayer?: Array<Record<string, unknown>>;
    };
    try {
      w.fbq?.("track", "InitiateCheckout", {
        value: priceCents / 100,
        currency: "BRL",
        content_name: label,
      });
      (w.dataLayer ||= []).push({
        event: "initiate_checkout",
        content_name: label,
        value: priceCents / 100,
        currency: "BRL",
      });
    } catch {
      /* noop */
    }
  };

  const openAuth = (label: string, price: string) => {
    setSelectedPlan({ label, price });
    setAuthView("menu");
    setAuthOpen(true);
  };

  const resetAuth = () => {
    setAuthOpen(false);
    setAuthView("menu");
  };

  const parsePrice = (price: string) => {
    const n = Number(price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  const goCheckout = async (values: Record<string, string>) => {
    customerRef.current = values;
    setBackOfferShown(false);
    setAuthOpen(false);
    setCheckoutMode(true);
    setPixLoading(true);
    setPixError(null);
    setPixCode(null);
    setPixQr(null);
    try {
      const amount = parsePrice(selectedPlan.price);
      const res = await createPix({
        data: {
          amount,
          description: `Assinatura ${selectedPlan.label} — @${HANDLE}`,
          customerEmail: values.email || "anonimo@example.com",
          customerName: values.name,
          customerDocument: values.cpf,
          productId: `plan-${selectedPlan.label.toLowerCase().replace(/\s+/g, "-")}`,
          tracking: getTracking(),
        },
      });
      if (!res.ok || !res.pixCopyPaste) {
        setPixError(res.error || "Não foi possível gerar o Pix.");
      } else {
        setPixCode(res.pixCopyPaste);
        setPixQr(res.qrCodeBase64 ?? null);
        if (res.id) setPaymentId(res.id);
      }
    } catch (e) {
      setPixError("Erro inesperado ao gerar o Pix.");
    } finally {
      setPixLoading(false);
    }
  };

  const copyPix = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <>
      {!ageConfirmed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" style={{ background: "#f5ede0" }}>
          <div className="w-full max-w-sm flex flex-col items-center text-center">
            <img src={privacyLogoAsset.url} alt="Privacy" className="w-40 h-40 object-contain mb-6" />
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "#1a1a1a" }}>
              privacy<span style={{ color: "#e85d3a" }}>.</span>
            </h1>
            <p className="mt-4 text-base" style={{ color: "#3a3a3a" }}>
              Este site contém conteúdo adulto. Você precisa ter <strong>18 anos ou mais</strong> para continuar.
            </p>
            <p className="mt-2 text-sm" style={{ color: "#6b6b6b" }}>
              Ao entrar, você confirma que é maior de idade.
            </p>
            <button
              onClick={() => {
                try { localStorage.setItem("ageConfirmed", "1"); } catch {}
                setAgeConfirmed(true);
              }}
              className="mt-8 w-full rounded-full py-4 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #f7931e 0%, #e85d3a 100%)" }}
            >
              Sou maior de 18 anos
            </button>
            <button
              onClick={() => { window.location.href = "https://www.google.com"; }}
              className="mt-3 text-sm underline"
              style={{ color: "#6b6b6b" }}
            >
              Sair
            </button>
          </div>
        </div>
      )}
    <div className="min-h-screen bg-background text-foreground flex justify-center">

      <div className="w-full max-w-[420px] min-h-screen bg-background relative pb-24">
        {/* Top bar */}
        <header className="relative flex items-center justify-center px-4 pt-4 pb-3">
          <button
            onClick={() => tryLeaveCheckout(() => {})}
            className="text-2xl font-semibold tracking-tight cursor-pointer"
          >
            privacy<span className="text-[oklch(0.78_0.17_45)]">.</span>
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground">
            <Globe className="h-5 w-5" />
          </button>
        </header>

        {/* Sub header */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => tryLeaveCheckout(exitCheckout)}
            className="h-8 w-8 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-medium">{DISPLAY_NAME}</h1>
          <button className="h-8 w-8 flex items-center justify-center">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Cover */}
        <div className="px-3 mt-1">
          <div className="relative h-44 rounded-2xl overflow-hidden bg-surface-2">
            <img
              src={COVER_IMG}
              alt="capa"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-44 object-cover -rotate-90"
            />
          </div>
        </div>

        {/* Avatar + stats */}
        <div className="px-4 -mt-10 relative flex items-end justify-between">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-background bg-surface-2 overflow-hidden">
              <img src={PROFILE_IMG} alt={DISPLAY_NAME} className="h-full w-full object-cover" />
            </div>
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-[oklch(0.7_0.18_145)] border-2 border-background" />
          </div>
          <div className="flex items-center gap-4 pb-1 text-sm">
            <Stat icon={<Images className="h-4 w-4" />} value="59" />
            <Stat icon={<Film className="h-4 w-4" />} value="26" />
            <Stat icon={<Lock className="h-4 w-4" />} value="10" />
            <Stat icon={<Heart className="h-4 w-4" />} value="2.6K" />
          </div>
        </div>

        {/* Identity */}
        <div className="px-4 mt-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-semibold">{DISPLAY_NAME}</h2>
            <BadgeCheck className="h-5 w-5 text-[oklch(0.7_0.15_220)] fill-[oklch(0.7_0.15_220)] text-background" />
          </div>
          <p className="text-sm text-muted-foreground">@{HANDLE}</p>

          <p className="text-sm mt-3 leading-relaxed">
            Tenha 18 aninhos, Sou estudante de Ed. Física e garanto que vou ser aquela estudante que você sempre quis ver do melhor jeito possível, venha avaliar meu shape kkkk. Conteúdo exclusivo e bate-papo diário com os assinantes 💬✨
          </p>
        </div>

        {checkoutMode ? (
          <>
            {/* Benefícios exclusivos */}
            <section className="px-4 mt-6">
              <h3 className="text-base font-semibold mb-3">Benefícios exclusivos</h3>
              <ul className="space-y-2.5 text-sm">
                <BenefitItem text="Acesso ao conteúdo" />
                <BenefitItem text="Chat exclusivo com o criador" />
                <BenefitItem text="Cancele a qualquer hora" />
              </ul>
            </section>

            <div className="px-4 mt-6">
              <div className="border-t border-border" />
            </div>

            {/* Formas de pagamento */}
            <section className="px-4 mt-5">
              <h3 className="text-base font-semibold mb-1">Formas de pagamento</h3>
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-2xl font-semibold mt-1 mb-4">{selectedPlan.price}</p>

              <div className="rounded-2xl border border-border bg-surface px-4 py-3 mb-4 overflow-hidden min-h-[48px] flex items-center">
                {pixLoading ? (
                  <p className="text-xs text-muted-foreground">Gerando código Pix…</p>
                ) : pixError ? (
                  <p className="text-xs text-destructive">{pixError}</p>
                ) : pixCode ? (
                  <p className="text-xs text-muted-foreground font-mono break-all line-clamp-2">{pixCode}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Aguardando…</p>
                )}
              </div>

              <button
                onClick={copyPix}
                disabled={!pixCode}
                className="gradient-orange w-full rounded-full h-12 text-brand-foreground font-medium shadow-[0_4px_20px_-8px_oklch(0.78_0.17_45/0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar chave Pix"}
              </button>

              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3">Como pagar em 3 passos</h4>
                <ol className="space-y-3">
                  <PayStep n={1} title="Copie o código Pix" text="Toque em “Copiar chave Pix” acima." />
                  <PayStep n={2} title="Abra o app do seu banco" text="Entre na área Pix e escolha “Pix Copia e Cola”." />
                  <PayStep n={3} title="Cole o código e confirme" text="Revise o valor e finalize o pagamento. A liberação é automática." />
                </ol>
              </div>
            </section>
          </>
        ) : (
          <>
            {authOpen ? (
              <section className="px-4 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">
                    {authView === "menu" && "Acesse sua conta"}
                    {authView === "signin" && "Entrar"}
                    {authView === "signup" && "Criar conta"}
                    {authView === "anon" && "Assinar anonimamente"}
                  </h3>
                  <span className="text-sm font-semibold text-[oklch(0.55_0.17_35)]">
                    {selectedPlan.label} · {selectedPlan.price}
                  </span>
                </div>

                {authView === "menu" && (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Escolha como deseja continuar para concluir sua assinatura.
                    </p>
                    <div className="flex flex-col gap-3">
                      <AuthOption
                        icon={<LogIn className="h-5 w-5" />}
                        title="Acesse sua conta"
                        description="Já sou cadastrado(a)"
                        onClick={() => {
                          fireInitiateCheckout(selectedPlan.label, Math.round(parsePrice(selectedPlan.price) * 100));
                          setAuthView("signin");
                        }}
                      />
                      <AuthOption
                        icon={<UserPlus className="h-5 w-5" />}
                        title="Criar conta"
                        description="Sou novo(a) por aqui"
                        onClick={() => {
                          fireInitiateCheckout(selectedPlan.label, Math.round(parsePrice(selectedPlan.price) * 100));
                          setAuthView("signup");
                        }}
                      />
                      <AuthOption
                        icon={<EyeOff className="h-5 w-5" />}
                        title="Assinar de forma anônima"
                        description="Sem cadastro, com privacidade"
                        onClick={() => {
                          fireInitiateCheckout(selectedPlan.label, Math.round(parsePrice(selectedPlan.price) * 100));
                          setAuthView("anon");
                        }}
                      />
                    </div>
                    <button
                      onClick={resetAuth}
                      className="mt-4 w-full h-10 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {authView === "signin" && (
                  <AuthForm
                    fields={[
                      { name: "email", label: "Email/CPF", type: "text" },
                      { name: "password", label: "Senha", type: "password" },
                    ]}
                    submitLabel="Entrar"
                    onBack={() => setAuthView("menu")}
                    onSubmit={goCheckout}
                  />
                )}

                {authView === "signup" && (
                  <AuthForm
                    fields={[
                      { name: "name", label: "Nome completo", type: "text" },
                      { name: "cpf", label: "CPF", type: "text" },
                      { name: "email", label: "Email", type: "email" },
                      { name: "password", label: "Senha", type: "password" },
                    ]}
                    submitLabel="Criar conta e continuar"
                    onBack={() => setAuthView("menu")}
                    onSubmit={goCheckout}
                  />
                )}

                {authView === "anon" && (
                  <AuthForm
                    fields={[{ name: "email", label: "Email", type: "email" }]}
                    submitLabel="Continuar anonimamente"
                    onBack={() => setAuthView("menu")}
                    onSubmit={goCheckout}
                  />
                )}
              </section>
            ) : (
              <>
                {/* Subscriptions */}
                <section className="px-4 mt-6">
                  <h3 className="text-base font-semibold mb-3">Assinaturas</h3>
                  <PlanButton label="1 mês" price="R$ 15,99" onClick={() => openAuth("1 mês", "R$ 15,99")} />
                </section>

                {/* Promotions */}
                <section className="px-4 mt-5">
                  <button
                    onClick={() => setPromosOpen((v) => !v)}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h3 className="text-base font-semibold">Promoções</h3>
                    <ChevronUp
                      className={`h-5 w-5 transition-transform ${promosOpen ? "" : "rotate-180"}`}
                    />
                  </button>
                  {promosOpen && (
                    <div className="space-y-3">
                      <PlanButton label="3 meses" price="R$ 21,90" onClick={() => openAuth("3 meses", "R$ 21,90")} />
                      <PlanButton label="Vitalício" price="R$ 35,80" onClick={() => openAuth("Vitalício", "R$ 35,80")} />
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Tabs */}
            <nav className="mt-8 border-t border-border">
              <div className="grid grid-cols-2">
                <TabButton
                  active={tab === "posts"}
                  onClick={() => setTab("posts")}
                  icon={<Smartphone className="h-5 w-5" />}
                  label="55 Postagens"
                />
                <TabButton
                  active={tab === "media"}
                  onClick={() => setTab("media")}
                  icon={<Film className="h-5 w-5" />}
                  label="105 Mídias"
                />
              </div>
              <div className="relative h-0.5 bg-transparent">
                <div
                  className={`absolute top-0 h-0.5 w-1/2 bg-[oklch(0.78_0.17_45)] transition-transform ${
                    tab === "media" ? "translate-x-full" : ""
                  }`}
                />
              </div>
            </nav>

            {/* Locked post preview */}
            <section className="px-3 mt-4">
              <article className="rounded-2xl bg-surface overflow-hidden border border-border">
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-surface-2 overflow-hidden">
                      <img src={PROFILE_IMG} alt={DISPLAY_NAME} className="h-full w-full object-cover" />
                    </div>
                    <div className="leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold">{DISPLAY_NAME}</span>
                        <BadgeCheck className="h-4 w-4 text-[oklch(0.7_0.15_220)] fill-[oklch(0.7_0.15_220)] text-background" />
                      </div>
                      <span className="text-xs text-muted-foreground">@{HANDLE}</span>
                    </div>
                  </div>
                  <button className="h-8 w-8 grid place-items-center">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative mx-3 mb-3 aspect-square rounded-2xl bg-[oklch(0.93_0.015_85)] grid place-items-center overflow-hidden">
                  <Lock className="h-12 w-12 text-[oklch(0.55_0.04_260)]" strokeWidth={2.25} />
                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4 text-[oklch(0.4_0.03_260)] text-sm font-medium">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" /> 59
                    </span>
                    <span className="flex items-center gap-1">
                      <Film className="h-4 w-4" /> 26
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" /> 2.6K
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 pb-4">
                  <div className="flex items-center gap-4 text-foreground">
                    <Heart className="h-5 w-5" />
                    <MessageCircle className="h-5 w-5" />
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <Bookmark className="h-5 w-5" />
                </div>
              </article>
            </section>
          </>
        )}
      </div>




      <Dialog open={backOfferOpen} onOpenChange={setBackOfferOpen}>
        <DialogContent className="max-w-[360px] rounded-2xl p-6 bg-[oklch(0.985_0.005_60)] border-0">
          <DialogHeader>
            <DialogTitle className="text-left text-xl">Espera! Oferta exclusiva 🔥</DialogTitle>
          </DialogHeader>

          <div className="rounded-xl bg-[oklch(0.96_0.04_45)] text-[oklch(0.45_0.15_35)] px-3 py-2 text-center text-xs font-semibold">
            ⏱ Você tem {formatTime(offerSecondsLeft)} para aceitar
          </div>

          <p className="text-sm text-foreground mt-2">
            Só agora, leve o <b>acesso vitalício</b> ao meu conteúdo + <b>uma chamada de vídeo de 10 minutos</b> comigo por apenas:
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-foreground">{OFFER_PRICE_LABEL}</span>
            <span className="text-xs text-muted-foreground line-through">de R$ 35,80</span>
          </div>

          {offerPixCode ? (
            <>
              <div className="rounded-2xl border border-border bg-surface px-4 py-3 mt-3 overflow-hidden">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Pix Copia e Cola</p>
                <p className="text-xs text-foreground font-mono break-all line-clamp-3">{offerPixCode}</p>
              </div>
              <button
                onClick={copyOfferPix}
                className="gradient-orange w-full rounded-full h-12 mt-3 text-brand-foreground font-medium flex items-center justify-center gap-2"
              >
                {offerCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {offerCopied ? "Copiado!" : "Copiar chave Pix"}
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Cole no app do seu banco em Pix Copia e Cola e finalize.
              </p>
            </>
          ) : (
            <>
              {offerPixError && (
                <p className="text-xs text-destructive mt-2">{offerPixError}</p>
              )}
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={acceptOffer}
                  disabled={offerPixLoading || offerSecondsLeft <= 0}
                  className="gradient-orange w-full rounded-full h-12 text-brand-foreground font-medium disabled:opacity-50"
                >
                  {offerPixLoading
                    ? "Gerando Pix…"
                    : offerSecondsLeft <= 0
                      ? "Oferta expirada"
                      : `Aceitar oferta por ${OFFER_PRICE_LABEL}`}
                </button>
                <button
                  onClick={() => {
                    setBackOfferOpen(false);
                    exitCheckout();
                  }}
                  className="w-full h-10 text-sm text-muted-foreground hover:text-foreground"
                >
                  Não, recusar e sair
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
    </>
  );
}

function AuthOption({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 rounded-2xl bg-background border border-border px-4 py-3 text-left hover:bg-surface-2 transition-colors">
      <div className="h-10 w-10 rounded-full grid place-items-center bg-[oklch(0.96_0.04_45)] text-[oklch(0.55_0.17_35)]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

type AuthField = { name: string; label: string; type: string };

function AuthForm({
  fields,
  submitLabel,
  onBack,
  onSubmit,
}: {
  fields: AuthField[];
  submitLabel: string;
  onBack: () => void;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const allFilled = fields.every((f) => (values[f.name] ?? "").trim().length > 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (allFilled) onSubmit(values);
      }}
      className="flex flex-col gap-3"
    >
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[oklch(0.55_0.17_35)]">{f.label}</span>
          <input
            type={f.type}
            value={values[f.name] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            className="h-11 rounded-xl bg-background border border-border px-3 text-base text-foreground outline-none focus:border-[oklch(0.78_0.17_45)]"
          />
        </label>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-4 rounded-full border border-border text-sm text-foreground hover:bg-surface-2"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={!allFilled}
          className="gradient-orange flex-1 h-11 rounded-full text-brand-foreground font-medium disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}


function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      {icon}
      <span className="text-foreground text-sm font-medium">{value}</span>
    </div>
  );
}

function PlanButton({ label, price, onClick }: { label: string; price: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="gradient-orange w-full rounded-full h-12 px-5 flex items-center justify-between text-brand-foreground font-medium shadow-[0_4px_20px_-8px_oklch(0.78_0.17_45/0.5)]">
      <span>{label}</span>
      <span>{price}</span>
    </button>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-4 text-sm font-medium ${
        active ? "text-[oklch(0.78_0.17_45)]" : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2.5 text-foreground">
      <span className="h-5 w-5 rounded-full grid place-items-center bg-[oklch(0.96_0.04_45)] text-[oklch(0.55_0.17_35)]">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
      {text}
    </li>
  );
}

function PayStep({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="h-7 w-7 shrink-0 rounded-full grid place-items-center bg-[oklch(0.96_0.04_45)] text-[oklch(0.55_0.17_35)] text-sm font-semibold">
        {n}
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{text}</div>
      </div>
    </li>
  );
}
