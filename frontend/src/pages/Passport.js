import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import CollectibleIcon from "../components/CollectibleIcon";
import ExplorerCard from "../components/ExplorerCard";
import { Stamp, BookText, Award, Lock, ArrowRight } from "lucide-react";

export default function Passport() {
  const { regions, progress, statusOf } = useApp();
  const navigate = useNavigate();

  const stats = progress?.stats;
  const completed = stats?.completedCount || 0;
  const total = stats?.total || regions.length || 8;
  const milestones = stats?.milestones || [2, 4, 6, 8];

  const accentOf = (slug) => regions.find((r) => r.slug === slug)?.accent || "#c1272d";
  const collectibles = (progress?.collectibles || []).map((c) => ({
    ...c,
    accent: accentOf(c.region_slug),
  }));

  const stories = progress?.stories || {};
  const storyList = Object.keys(stories)
    .map((slug) => regions.find((r) => r.slug === slug))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 md:px-6" data-testid="passport-page">
      {/* Passport header */}
      <div className="relative overflow-hidden rounded-2xl arsip-card p-6 shadow-arsip md:p-8">
        <div className="pointer-events-none absolute -right-6 -top-6 rotate-12 opacity-10">
          <Stamp size={160} />
        </div>
        <p className="stamp text-[11px] text-merah">Republik Indonesia · Dokumen Perjalanan</p>
        <h1 className="mt-1 font-display text-4xl font-black text-tinta md:text-5xl">Nusa Passport</h1>
        <p className="mt-2 max-w-lg text-tinta/70">
          Catatan resmi perjalananmu mengelilingi Nusantara — wilayah, cerita, dan koleksi.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatBox icon={Stamp} label="Wilayah dijelajahi" value={`${completed}/${total}`} />
          <StatBox icon={BookText} label="Cerita ditemukan" value={storyList.length} />
          <StatBox icon={Award} label="Collectible" value={collectibles.length} />
        </div>

        {/* level + milestones */}
        <div className="mt-5 rounded-xl border border-sepia/25 bg-kertas/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-sepia">Level Explorer</p>
              <p className="font-display text-2xl font-bold text-tinta">
                {stats?.level?.title || "Musafir Baru"}
              </p>
              <p className="text-sm text-sepia">{stats?.level?.note}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {milestones.map((m) => {
              const reached = completed >= m;
              return (
                <div key={m} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-soft ${
                      reached ? "bg-emas text-white" : "bg-kertas2 text-sepia"
                    }`}
                    data-testid={`milestone-${m}`}
                  >
                    {reached ? m : <Lock size={15} />}
                  </div>
                  <span className="text-[10px] text-sepia">{m} wilayah</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stamps grid */}
      <section className="pt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-tinta">Stempel Wilayah</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {regions.map((r) => {
            const st = statusOf(r.slug);
            const done = st === "selesai";
            return (
              <button
                key={r.slug}
                onClick={() => navigate(`/jelajah/${r.slug}`)}
                data-testid={`passport-stamp-${r.slug}`}
                className="group flex flex-col items-center rounded-2xl arsip-card p-4 shadow-arsip transition-soft hover:-translate-y-1"
              >
                <div
                  className={`stamp-ring flex h-20 w-20 items-center justify-center text-center transition-soft ${
                    done ? "" : "opacity-40"
                  }`}
                  style={{ color: done ? r.accent : "#8a7860" }}
                >
                  <span className="stamp px-1 text-[9px] font-bold leading-tight">
                    {done ? r.name : "belum\ndicap"}
                  </span>
                </div>
                <p className="mt-3 text-center text-sm font-semibold text-tinta">{r.name}</p>
                <p className="text-[11px] text-sepia">{done ? "Selesai" : st === "berlangsung" ? "Berlangsung" : "Belum dimulai"}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Collectibles */}
      <section className="pt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-tinta">Koleksi Nusantara</h2>
        {collectibles.length === 0 ? (
          <div className="rounded-2xl arsip-card p-8 text-center shadow-arsip" data-testid="empty-collectibles">
            <Award size={36} className="mx-auto text-sepia" />
            <p className="mt-3 text-sepia">Belum ada collectible. Selesaikan sebuah cerita untuk mendapatkan yang pertama.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-merah px-5 py-2.5 font-semibold text-white transition-soft hover:bg-merahdark"
            >
              Mulai menjelajah <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collectibles.map((c) => (
              <div key={c.id} className="flex gap-4 rounded-2xl arsip-card p-4 shadow-arsip rise-in" data-testid={`collectible-${c.region_slug}`}>
                <span
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: c.accent }}
                >
                  <CollectibleIcon name={c.icon} size={30} strokeWidth={1.6} />
                </span>
                <div>
                  <span className="stamp text-[10px] text-sepia">{c.type} · {c.region_name}</span>
                  <h3 className="font-display text-lg font-bold leading-tight text-tinta">{c.name}</h3>
                  <p className="mt-1 text-xs leading-snug text-tinta/70">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stories found */}
      {storyList.length > 0 && (
        <section className="pt-10">
          <h2 className="mb-4 font-display text-2xl font-bold text-tinta">Cerita yang ditemukan</h2>
          <div className="divide-y divide-sepia/20 overflow-hidden rounded-2xl arsip-card shadow-arsip">
            {storyList.map((r) => (
              <button
                key={r.slug}
                onClick={() => navigate(`/jelajah/${r.slug}`)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-soft hover:bg-kertas2"
                data-testid={`story-found-${r.slug}`}
              >
                <div>
                  <p className="font-display text-lg font-semibold text-tinta">{r.storyTitle}</p>
                  <p className="text-sm text-sepia">{r.name} · {r.category}</p>
                </div>
                <ArrowRight size={18} className="text-merah" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Explorer card */}
      <section className="pt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-tinta">Explorer Card</h2>
        {completed > 0 ? (
          <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr] md:items-start">
            <ExplorerCard stats={stats} collectibles={collectibles} regionsTotal={total} />
            <p className="text-sm leading-relaxed text-tinta/70">
              Bagikan perjalananmu ke teman dan media sosial. Kartu ini merangkum level explorer,
              jumlah wilayah, dan collectible terbaru yang kamu kumpulkan.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl arsip-card p-8 text-center text-sepia shadow-arsip" data-testid="card-locked">
            Selesaikan minimal satu wilayah untuk membuka Explorer Card.
          </div>
        )}
      </section>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sepia/25 bg-kertas/60 p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tinta text-kertas">
        <Icon size={20} />
      </span>
      <div>
        <p className="font-display text-2xl font-black leading-none text-tinta">{value}</p>
        <p className="text-xs text-sepia">{label}</p>
      </div>
    </div>
  );
}
