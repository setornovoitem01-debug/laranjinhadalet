import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShieldCheck, Mail } from "lucide-react";
import profileAsset from "@/assets/profile.png.asset.json";
import coverAsset from "@/assets/cover.png.asset.json";

const ACCENT = "#e85d3a";

export const Route = createFileRoute("/final")({
  head: () => ({
    meta: [
      { title: "Obrigada pela sua compra — @lettvargas" },
      {
        name: "description",
        content: "Sua compra foi confirmada com sucesso. Obrigada por fazer parte!",
      },
    ],
  }),
  component: FinalPage,
});

function FinalPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Cabeçalho com a logo Privacy */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-4 flex items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-zinc-900">
            privacy<span style={{ color: ACCENT }}>.</span>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-md">
        {/* Capa (deitada, igual à home) */}
        <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
          <img
            src={coverAsset.url}
            alt="capa"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-44 object-cover -rotate-90"
          />
          {/* Foto de perfil sobre a capa (sem ultrapassar pra baixo) */}
          <div className="absolute left-5 bottom-3">
            <img
              src={profileAsset.url}
              alt="leticia"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              style={{ boxShadow: "0 6px 24px rgba(232,93,58,0.25)" }}
            />
          </div>
        </div>

        <div className="px-5 pt-5 pb-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900">leticia</h1>
            <span
              className="inline-flex items-center justify-center rounded-full text-white text-[10px] w-4 h-4"
              style={{ background: ACCENT }}
              aria-label="verificada"
            >
              ✓
            </span>
          </div>
          <p className="text-sm text-zinc-500">@lettvargas</p>

          <div
            className="mt-6 rounded-2xl border p-5"
            style={{
              borderColor: `${ACCENT}33`,
              background: "linear-gradient(160deg, #fff7f3 0%, #ffffff 70%)",
            }}
          >
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: ACCENT }}
            >
              <Heart className="w-4 h-4" />
              Muito obrigada, amor 💖
            </div>

            <h2 className="mt-3 text-2xl font-bold leading-snug text-zinc-900">
              Sua compra foi confirmada!
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              De coração: <strong className="text-zinc-900">muito obrigada</strong> por
              confiar em mim e fazer parte dos meus assinantes especiais. Pessoas como você
              são o motivo de eu amar tanto o que faço por aqui 🥺💋
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Já tô preparando tudo com muito carinho pra você aproveitar cada detalhe do
              meu conteúdo. Tenho certeza que você vai{" "}
              <strong className="text-zinc-900">se apaixonar</strong> 😘
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 flex items-start gap-3">
            <div
              className="shrink-0 mt-0.5 rounded-full p-2"
              style={{ background: `${ACCENT}1A` }}
            >
              <Mail className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-zinc-900">
                Fique de olho no seu e-mail
              </p>
              <p className="text-zinc-600 mt-1">
                Em alguns minutos você recebe todas as informações de acesso por lá
                (confere a caixa de spam também, viu?).
              </p>
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3 h-3" /> Conteúdo protegido pela Privacy
          </p>
        </div>
      </div>
    </div>
  );
}