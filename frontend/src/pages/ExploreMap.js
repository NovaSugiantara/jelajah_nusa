import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import RegionMap from "../components/RegionMap";
import CollectibleIcon from "../components/CollectibleIcon";
import { ArrowRight } from "lucide-react";

const STATUS_BADGE = {
  selesai: { text: "Selesai", cls: "bg-emas/20 text-emas border-emas/40" },
  berlangsung: { text: "Berlangsung", cls: "bg-merah/15 text-merah border-merah/40" },
  belum: { text: "Belum dimulai", cls: "bg-kertas2 text-sepia border-sepia/30" },
};

export default function ExploreMap() {
  const { regions, statusOf, loading, error, refresh } = useApp();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
      <div className="pt-8 md:pt-12">
        <p className="stamp text-[11px] text-merah">Edisi eksplorasi</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-tinta md:text-5xl">
          Peta Nusantara
        </h1>
        <p className="mt-3 max-w-xl text-tinta/75">
          Pilih provinsi untuk memulai cerita. Setiap perjalanan singkat membawamu pada satu pilihan dan
          satu penemuan baru.
        </p>
      </div>

      {error && (
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-merah/40 bg-merah/10 px-4 py-3 text-sm text-tinta"
          data-testid="map-error"
        >
          <span>{error}</span>
          <button
            onClick={refresh}
            className="rounded-full bg-merah px-4 py-2 font-semibold text-white"
          >
            Coba lagi
          </button>
        </div>
      )}

      <section id="peta" className="pt-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sepia">Memuat peta…</div>
        ) : (
          regions.length > 0 && (
            <RegionMap regions={regions} statusOf={statusOf} onSelect={(slug) => navigate(`/jelajah/${slug}`)} />
          )
        )}
      </section>

      <section className="pt-12">
        <h2 className="mb-4 font-display text-2xl font-bold text-tinta">Pilih provinsi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {regions.map((r) => {
            const st = statusOf(r.slug);
            const badge = STATUS_BADGE[st];
            return (
              <button
                key={r.slug}
                onClick={() => navigate(`/jelajah/${r.slug}`)}
                data-testid={`region-card-${r.slug}`}
                className="group overflow-hidden rounded-2xl arsip-card text-left shadow-arsip transition-soft hover:-translate-y-1"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={r.thumbnail.src}
                    alt={r.thumbnail.alt}
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
