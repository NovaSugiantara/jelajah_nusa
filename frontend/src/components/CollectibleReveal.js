import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import CollectibleIcon from "./CollectibleIcon";
import audioEngine from "../lib/audio";

export default function CollectibleReveal({ collectible, regionName, accent, onClose, onPassport, onExplore }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    audioEngine.chime();
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!collectible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ background: "rgba(43,38,32,0.7)" }}
      data-testid="collectible-reveal"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="collectible-title"
        className="relative w-full max-w-sm rise-in"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Tutup"
          data-testid="collectible-close"
          className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-tinta text-kertas transition-soft hover:rotate-90"
        >
          <X size={18} />
        </button>

        <div className="overflow-hidden rounded-2xl arsip-card shadow-arsip">
          <div className="px-6 pt-6 text-center">
            <p className="stamp text-[11px] text-merah">Collectible baru</p>
            <p className="mt-1 text-sm text-sepia">Kamu menyelesaikan cerita {regionName}</p>
          </div>

          <div className="flex justify-center py-6">
            <div
              className="stamp-drop flex h-28 w-28 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{ background: accent }}
            >
              <CollectibleIcon name={collectible.icon} size={52} strokeWidth={1.6} />
            </div>
          </div>

          <div className="px-6 pb-2 text-center">
            <span className="stamp inline-block rounded-full border border-sepia/40 px-2.5 py-0.5 text-[10px] text-sepia">
              {collectible.type}
            </span>
            <h3 id="collectible-title" className="mt-2 font-display text-2xl font-bold text-tinta">
              {collectible.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-tinta/75">{collectible.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-6">
            <button
              onClick={onExplore}
              data-testid="collectible-continue"
              className="rounded-full border border-tinta/25 px-4 py-2.5 text-sm font-semibold text-tinta transition-soft hover:bg-kertas2"
            >
              Jelajah lain
            </button>
            <button
              onClick={onPassport}
              data-testid="collectible-passport"
              className="rounded-full bg-tinta px-4 py-2.5 text-sm font-semibold text-kertas transition-soft hover:opacity-90"
            >
              Buka Passport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
