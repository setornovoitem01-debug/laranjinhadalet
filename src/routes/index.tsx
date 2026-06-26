import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Compass,
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
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import profileAsset from "@/assets/profile.png.asset.json";
import coverAsset from "@/assets/cover.png.asset.json";

const PROFILE_IMG = profileAsset.url;
const COVER_IMG = coverAsset.url;
const DISPLAY_NAME = "leticia";
const HANDLE = "lettvargas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Perfil — Demo" },
      { name: "description", content: "Página de perfil de demonstração." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [promosOpen, setPromosOpen] = useState(true);
  const [tab, setTab] = useState<"posts" | "media">("posts");
  const [authOpen, setAuthOpen] = useState(false);
  const openAuth = () => setAuthOpen(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen bg-background relative pb-24">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="text-2xl font-semibold tracking-tight">
            privacy<span className="text-[oklch(0.78_0.17_45)]">.</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-full bg-surface flex items-center justify-center border border-border">
              <Compass className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-xs font-semibold border border-border">
              GO
            </button>
          </div>
        </header>

        {/* Sub header */}
        <div className="flex items-center justify-between px-4 py-2">
          <button className="h-8 w-8 flex items-center justify-center">
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
            18 anos, estudante de Ed. Física. Conteúdo exclusivo e bate-papo diário com os assinantes 💬✨
          </p>
        </div>

        {/* Subscriptions */}
        <section className="px-4 mt-6">
          <h3 className="text-base font-semibold mb-3">Assinaturas</h3>
          <PlanButton label="1 mês" price="R$ 15,99" onClick={openAuth} />
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
              <PlanButton label="3 meses" price="R$ 21,90" />
              <PlanButton label="Vitalício" price="R$ 35,80" />
            </div>
          )}
        </section>

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
      </div>
    </div>
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
