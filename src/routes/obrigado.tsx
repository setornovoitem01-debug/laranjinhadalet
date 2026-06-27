import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Mail, Video, Clock, Sparkles } from "lucide-react";
import profileAsset from "@/assets/profile.png.asset.json";
import profile2Url from "@/assets/profile2.png";
import { useServerFn } from "@tanstack/react-start";
import { createPixPayment } from "@/lib/pix.functions";

export const Route = createFileRoute("/obrigado")({
  head: () => ({
    meta: [
      { title: "Obrigado pela assinatura — @lettvargas" },
      { name: "description", content: "Assinatura confirmada. Seu conteúdo será liberado em até 5 minutos por e-mail." },
    ],
  }),
  component: ObrigadoPage,
});

const UPSELL_PRICE = "R$ 19,90";
const UPSELL_AMOUNT = 19.9;
const UPSELL2_PRICE = "R$ 9,90";
const UPSELL2_AMOUNT = 9.9;

function ObrigadoPage() {
  const createPix = useServerFn(createPixPayment);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixQr, setPixQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading2, setLoading2] = useState(false);
  const [error2, setError2] = useState<string | null>(null);
  const [pixCode2, setPixCode2] = useState<string | null>(null);
  const [pixQr2, setPixQr2] = useState<string | null>(null);
  const [copied2, setCopied2] = useState(false);
  const [declined2, setDeclined2] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  function goToStep2() {
    setTransitioning(true);
    setTimeout(() => {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "auto" });
      setTransitioning(false);
    }, 350);
  }

  async function handleUpsell() {
    setLoading(true);
    setError(null);
    try {
      const res = await createPix({
        data: {
          amount: UPSELL_AMOUNT,
          description: "Chamada de vídeo 15min com Leticia",
          customerEmail: "cliente@privacy.com",
          customerName: "Cliente",
        },
      });
      setPixCode(res.pixCopyPaste ?? null);
      setPixQr(res.qrCodeBase64 ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar PIX");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpsell2() {
    setLoading2(true);
    setError2(null);
    try {
      const res = await createPix({
        data: {
          amount: UPSELL2_AMOUNT,
          description: "Chamada exclusiva 15min com Leticia + irmã",
          customerEmail: "cliente@privacy.com",
          customerName: "Cliente",
        },
      });
      setPixCode2(res.pixCopyPaste ?? null);
      setPixQr2(res.qrCodeBase64 ?? null);
    } catch (e) {
      setError2(e instanceof Error ? e.message : "Erro ao gerar PIX");
    } finally {
      setLoading2(false);
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

  async function copyCode2() {
    if (!pixCode2) return;
    try {
      await navigator.clipboard.writeText(pixCode2);
      setCopied2(true);
      setTimeout(() => setCopied2(false), 2000);
    } catch {}
  }

  const ACCENT = "#e85d3a";

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-md px-5 py-8">
        {/* Privacy text logo (same as home) */}
        <header className="flex items-center justify-center pb-6">
          <span className="text-3xl font-semibold tracking-tight text-zinc-900">
            privacy<span style={{ color: ACCENT }}>.</span>
          </span>
        </header>

        <div
          className={`transition-all duration-300 ${transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
        >
        {step === 1 ? (
        <>
        {/* Profile + greeting */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={profileAsset.url}
              alt="leticia"
              className="w-44 h-44 rounded-full object-cover border-4 shadow-[0_8_30px_rgba(232,93,58,0.25)]"
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
            Obrigada pela sua assinatura! 💖
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Sua assinatura foi confirmada com sucesso. Seja muito bem-vindo(a) ao meu
            conteúdo exclusivo.
          </p>
        </div>

        {/* Upsell — em destaque, ACIMA do aviso de email */}
        <div
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
            <Sparkles className="w-4 h-4" />
            Oferta exclusiva (só agora)
          </div>

          <h2 className="mt-3 text-xl font-bold leading-snug text-zinc-900">
            Chamada de vídeo de 15 minutos comigo 🎥
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Quer me conhecer de verdade? Marca uma{" "}
            <strong className="text-zinc-900">chamada de vídeo privada de 15 minutos</strong>{" "}
            comigo — só nós dois, do jeitinho que você quiser.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            <li className="flex items-center gap-2">
              <Video className="w-4 h-4" style={{ color: ACCENT }} /> Vídeo chamada 100% privada
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: ACCENT }} /> 15 minutos só pra você
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: ACCENT }} /> Atendimento personalizado
            </li>
          </ul>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900">{UPSELL_PRICE}</span>
          </div>

          {!pixCode && !declined && (
            <button
              onClick={handleUpsell}
              disabled={loading}
              className="mt-5 w-full rounded-full py-4 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f7931e 0%, #e85d3a 100%)" }}
            >
              {loading ? "Gerando PIX..." : "QUERO MINHA CHAMADA AGORA"}
            </button>
          )}

          {!pixCode && (
            <button
              onClick={goToStep2}
              className="mt-3 w-full rounded-full py-3 text-sm font-medium text-zinc-500 hover:text-zinc-700"
            >
              Não, obrigado
            </button>
          )}

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          {pixCode && (
            <div className="mt-5 rounded-xl bg-zinc-50 border border-zinc-200 p-4">
              {pixQr && (
                <img
                  src={pixQr.startsWith("data:") ? pixQr : `data:image/png;base64,${pixQr}`}
                  alt="QR Code PIX"
                  className="mx-auto w-48 h-48 rounded-lg bg-white p-2 border border-zinc-200"
                />
              )}
              <p className="mt-3 text-xs text-zinc-500 text-center">PIX Copia e Cola</p>
              <div className="mt-2 rounded-md bg-white border border-zinc-200 p-2 text-[11px] break-all text-zinc-700 max-h-24 overflow-auto">
                {pixCode}
              </div>
              <button
                onClick={copyCode}
                className="mt-3 w-full rounded-lg font-semibold py-2.5 text-sm text-white"
                style={{ background: ACCENT }}
              >
                {copied ? "Copiado!" : "Copiar código PIX"}
              </button>
            </div>
          )}
        </div>
        </>
        ) : (
        <div key="step2" className="animate-fade-in">
        {/* Segundo upsell — foto + oferta especial */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={profile2Url}
              alt="leticia"
              className="w-48 h-48 rounded-full object-cover border-4 shadow-[0_8px_30px_rgba(232,93,58,0.3)]"
              style={{ borderColor: ACCENT }}
            />
          </div>
          <p
            className="mt-5 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: ACCENT }}
          >
            Espera, meu amor 💋
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-zinc-900">
            Tenho uma oferta MUITO melhor pra você…
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Como você é meu <strong className="text-zinc-900">novo assinante especial</strong>,
            quero te dar algo que <strong className="text-zinc-900">quase ninguém</strong> tem
            acesso. Uma experiência única, só nossa.
          </p>
        </div>

        <div
          className="mt-7 rounded-3xl border p-5 shadow-[0_10px_40px_rgba(232,93,58,0.18)]"
          style={{
            borderColor: `${ACCENT}55`,
            background: "linear-gradient(160deg, #fff7f3 0%, #ffffff 60%)",
          }}
        >
          <div
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            style={{ color: ACCENT }}
          >
            <Sparkles className="w-4 h-4" />
            Oferta secreta — só pra você
          </div>

          <h2 className="mt-3 text-xl font-bold leading-snug text-zinc-900">
            Chamada de vídeo EXCLUSIVA de 15 minutos 🔥
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Meu conteúdo <strong className="text-zinc-900">ainda mais explícito</strong>, e dessa
            vez não vou estar sozinha… vou estar com a{" "}
            <strong className="text-zinc-900">minha irmã mais nova</strong> 😈. E o melhor:
            <strong className="text-zinc-900"> vou realizar um desejo seu</strong> ao vivo,
            do jeitinho que você sempre quis.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            <li className="flex items-center gap-2">
              <Video className="w-4 h-4" style={{ color: ACCENT }} /> Chamada privada eu + minha irmã
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: ACCENT }} /> 15 minutos sem censura
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: ACCENT }} /> Um desejo seu realizado ao vivo
            </li>
          </ul>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900">{UPSELL2_PRICE}</span>
            <span className="text-xs text-zinc-500">oferta única — não se repete</span>
          </div>

          {!pixCode2 && !declined2 && (
            <button
              onClick={handleUpsell2}
              disabled={loading2}
              className="mt-5 w-full rounded-full py-4 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f7931e 0%, #e85d3a 100%)" }}
            >
              {loading2 ? "Gerando PIX..." : "EU QUERO ESSA EXPERIÊNCIA"}
            </button>
          )}

          {!pixCode2 && !declined2 && (
            <button
              onClick={() => navigate({ to: "/final" })}
              className="mt-3 w-full rounded-full py-3 text-sm font-medium text-zinc-500 hover:text-zinc-700"
            >
              Não, obrigado
            </button>
          )}

          {declined2 && (
            <p className="mt-4 text-center text-sm text-zinc-500">
              Tudo bem, amor! Sua assinatura segue ativa. 💖
            </p>
          )}

          {error2 && <p className="mt-3 text-sm text-red-500">{error2}</p>}

          {pixCode2 && (
            <div className="mt-5 rounded-xl bg-zinc-50 border border-zinc-200 p-4">
              {pixQr2 && (
                <img
                  src={pixQr2.startsWith("data:") ? pixQr2 : `data:image/png;base64,${pixQr2}`}
                  alt="QR Code PIX"
                  className="mx-auto w-48 h-48 rounded-lg bg-white p-2 border border-zinc-200"
                />
              )}
              <p className="mt-3 text-xs text-zinc-500 text-center">PIX Copia e Cola</p>
              <div className="mt-2 rounded-md bg-white border border-zinc-200 p-2 text-[11px] break-all text-zinc-700 max-h-24 overflow-auto">
                {pixCode2}
              </div>
              <button
                onClick={copyCode2}
                className="mt-3 w-full rounded-lg font-semibold py-2.5 text-sm text-white"
                style={{ background: ACCENT }}
              >
                {copied2 ? "Copiado!" : "Copiar código PIX"}
              </button>
            </div>
          )}
        </div>
        </div>
        )}
        </div>

        {step === 1 && (
        <div className="mt-6 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 flex items-start gap-3 text-left">
          <div className="shrink-0 mt-0.5 rounded-full p-2" style={{ background: `${ACCENT}1A` }}>
            <Mail className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-zinc-900">
              Seu conteúdo será liberado em até 5 minutos
            </p>
            <p className="text-zinc-600 mt-1">
              Fique de olho no seu e-mail (e na caixa de spam) — enviaremos seu acesso completo
              ao conteúdo em alguns instantes.
            </p>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}