import { useEffect, useState } from "react";
import { Copy, Check, Clock } from "lucide-react";

const ACCENT = "#e85d3a";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function PixPaymentBlock({
  code,
  startedAt,
  durationSeconds = 5 * 60,
}: {
  code: string;
  startedAt: number;
  durationSeconds?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(
    0,
    durationSeconds - Math.floor((now - startedAt) / 1000),
  );
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const expired = remaining <= 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="mt-5 rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
      {/* Cronômetro */}
      <div
        className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
        style={{
          background: expired ? "#fee2e2" : `${ACCENT}1A`,
          color: expired ? "#b91c1c" : ACCENT,
        }}
      >
        <Clock className="w-4 h-4" />
        {expired ? (
          <span>Oferta expirada</span>
        ) : (
          <span>
            Pague em {pad(minutes)}:{pad(seconds)} ou perderá esta oferta
            especial
          </span>
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-500 text-center">PIX Copia e Cola</p>
      <div className="mt-2 rounded-md bg-white border border-zinc-200 p-3 text-[11px] break-all text-zinc-700 font-mono leading-relaxed">
        {code}
      </div>

      <button
        onClick={copy}
        disabled={expired}
        className="mt-3 w-full rounded-full font-semibold py-3 text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: ACCENT }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copiado!" : "Copiar código PIX"}
      </button>

      <div className="mt-5">
        <h4 className="text-sm font-semibold mb-3 text-zinc-900">
          Como pagar em 3 passos
        </h4>
        <ol className="space-y-3">
          <Step
            n={1}
            title="Copie o código Pix"
            text="Toque em “Copiar código PIX” acima."
          />
          <Step
            n={2}
            title="Abra o app do seu banco"
            text="Entre na área Pix e escolha “Pix Copia e Cola”."
          />
          <Step
            n={3}
            title="Cole o código e confirme"
            text="Revise o valor e finalize o pagamento. A liberação é automática."
          />
        </ol>
      </div>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span
        className="h-7 w-7 shrink-0 rounded-full grid place-items-center text-sm font-semibold"
        style={{ background: `${ACCENT}1A`, color: ACCENT }}
      >
        {n}
      </span>
      <div className="flex-1 text-left">
        <div className="text-sm font-medium text-zinc-900">{title}</div>
        <div className="text-xs text-zinc-600">{text}</div>
      </div>
    </li>
  );
}
