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
} from "lucide-react";
import { useState } from "react";

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
          <h1 className="text-base font-medium">usuario_demo</h1>
          <button className="h-8 w-8 flex items-center justify-center">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Cover */}
        <div className="px-3 mt-1">
          <div className="relative h-44 rounded-2xl overflow-hidden bg-surface-2">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.35_0.05_30)] via-[oklch(0.25_0.03_260)] to-[oklch(0.2_0.02_270)]" />
            <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/70">
              capa (placeholder)
            </span>
          </div>
        </div>

        {/* Avatar + stats */}
        <div className="px-4 -mt-10 relative flex items-end justify-between">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-background bg-surface-2 overflow-hidden grid place-items-center">
              <span className="text-2xl">👤</span>
            </div>
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-[oklch(0.7_0.18_145)] border-2 border-background" />
          </div>
          <div className="flex items-center gap-4 pb-1 text-sm">
            <Stat icon={<Images className="h-4 w-4" />} value="00" />
            <Stat icon={<Film className="h-4 w-4" />} value="00" />
            <Stat icon={<Lock className="h-4 w-4" />} value="00" />
            <Stat icon={<Heart className="h-4 w-4" />} value="0" />
          </div>
        </div>

        {/* Identity */}
        <div className="px-4 mt-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-semibold">usuario_demo</h2>
            <BadgeCheck className="h-5 w-5 text-[oklch(0.7_0.15_220)] fill-[oklch(0.7_0.15_220)] text-background" />
          </div>
          <p className="text-sm text-muted-foreground">@usuario_demo</p>

          <p className="text-sm mt-3 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore...
          </p>
          <button className="text-sm text-[oklch(0.78_0.17_45)] font-medium mt-1">
            Ler mais
          </button>
        </div>

        {/* Subscriptions */}
        <section className="px-4 mt-6">
          <h3 className="text-base font-semibold mb-3">Assinaturas</h3>
          <PlanButton label="1 mês" price="R$ 00,00" />
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
              <PlanButton label="3 meses (00% off )" price="R$ 00,00" />
              <PlanButton label="6 meses (00% off )" price="R$ 00,00" />
            </div>
          )}
        </section>

        {/* Bottom tabs */}
        <nav className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[420px] bg-background border-t border-border">
            <div className="grid grid-cols-2">
              <TabButton
                active={tab === "posts"}
                onClick={() => setTab("posts")}
                icon={<Smartphone className="h-5 w-5" />}
                label="00 Postagens"
              />
              <TabButton
                active={tab === "media"}
                onClick={() => setTab("media")}
                icon={<Film className="h-5 w-5" />}
                label="00 Mídias"
              />
            </div>
            <div className="relative h-0.5 bg-transparent">
              <div
                className={`absolute top-0 h-0.5 w-1/2 bg-[oklch(0.78_0.17_45)] transition-transform ${
                  tab === "media" ? "translate-x-full" : ""
                }`}
              />
            </div>
          </div>
        </nav>
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

function PlanButton({ label, price }: { label: string; price: string }) {
  return (
    <button className="gradient-orange w-full rounded-full h-12 px-5 flex items-center justify-between text-brand-foreground font-medium shadow-[0_4px_20px_-8px_oklch(0.78_0.17_45/0.5)]">
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
