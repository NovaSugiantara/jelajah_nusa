import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import RegionMap from "../components/RegionMap";
import CollectibleIcon from "../components/CollectibleIcon";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

const STATUS_BADGE = {
  selesai: { text: "Selesai", cls: "bg-emas/20 text-emas border-emas/40" },
  berlangsung: { text: "Berlangsung", cls: "bg-merah/15 text-merah border-merah/40" },
  belum: { text: "Belum dimulai", cls: "bg-kertas2 text-sepia border-sepia/30" },
};

export default function Home() {
  const { regions, statusOf, progress, loading } = useApp();
  const navigate = useNavigate();

  const stats = progress?.stats;
  const completed = stats?.completedCount || 0;
  const total = stats?.total || 8;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
      {/* Hero */}
      <section className="pt-8 md:pt-14">
        <div className="grid items-end gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="rise-in">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-merah/30 bg-merah/10 px-3 py-1 text-xs font-medium text-merah">
              <Sparkles size={13} /> Edukasi interaktif Nusantara
            </div>
            <h1 className="font-display text-4xl font-black leading-[1.02] tracking-tight text-tinta md:text-6xl">
              Kenali Indonesia.
              <br />
              <span className="text-merah">Satu cerita,</span> satu perjalanan.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-tinta/75 md:text-lg">
              Pilih sebuah wilayah di peta, ikuti kisah singkatnya, ambil keputusanmu,
              temukan fakta budaya, dan kumpulkan collectible ke dalam Nusa Passport.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById("peta")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="hero-explore-btn"
                className="group inline-flex items-center gap-2 rounded-full bg-merah px-6 py-3 font-semibold text-white transition-soft hover:bg-merahdark"
              >
                Mulai menjelajah
                <ArrowRight size={18} className="transition-soft group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate("/passport")}
                data-testid="hero-passport-btn"
                className="inline-flex items-center gap-2 rounded-full border border-tinta/25 px-6 py-3 font-semibold text-tinta transition-soft hover:bg-kertas2"
              >
                Lihat Passport
              </button>
            </div>
          </div>

          {/* progress card */}
          <div className="rise-in arsip-card rounded-2xl p-5 shadow-arsip" style={{ animationDelay: "0.1s" }} data-testid="progress-summary">
            <p className="stamp text-[11px] text-sepia">Perjalananmu</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-5xl font-black text-tinta">{completed}</span>
              <span className="mb-1.5 text-lg text-sepia">/ {total} wilayah</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-kertas2">
              <div
                className="h-full rounded-full bg-merah transition-soft"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-sepia/20 bg-kertas/60 px-3 py-2.5">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-sepia">Level Explorer</p>
                <p className="font-display text-lg font-bold text-tinta">
                  {stats?.level?.title || "Musafir Baru"}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tinta text-kertas">
                <MapPin size={18} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section id="peta" className="scroll-mt-20 pt-12 md:pt-16">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-tinta md:text-3xl">Peta Nusantara</h2>
          <span className="text-sm text-sepia">{loading ? "Memuat…" : `${regions.length} wilayah`}</span>
        </div>
        {regions.length > 0 && (
          <RegionMap regions={regions} statusOf={statusOf} onSelect={(slug) => navigate(`/jelajah/${slug}`)} />
        )}
      </section>

      {/* Region cards */}
      <section className="pt-12 md:pt-16">
        <h2 className="mb-4 font-display text-2xl font-bold text-tinta md:text-3xl">Pilih wilayah</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((r, i) => {
            const st = statusOf(r.slug);
            const badge = STATUS_BADGE[st];
            return (
              <button
                key={r.slug}
                onClick={() => navigate(`/jelajah/${r.slug}`)}
                data-testid={`region-card-${r.slug}`}
                className="group overflow-hidden rounded-2xl arsip-card text-left shadow-arsip transition-soft hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-soft group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(43,38,32,0.75))" }} />
                  <div className="absolute left-3 top-3">
                    <span className={`stamp rounded-full border px-2 py-0.5 text-[10px] backdrop-blur-sm ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[11px] uppercase tracking-wider text-white/70">{r.island}</p>
                    <h3 className="font-display text-xl font-bold text-white">{r.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm leading-snug text-tinta/75">{r.tagline}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-sepia/20 pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-sepia">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: r.accent }}>
                        <CollectibleIcon name={r.collectible.icon} size={13} />
                      </span>
                      {r.collectible.name}
                    </span>
                    <ArrowRight size={16} className="text-merah transition-soft group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
