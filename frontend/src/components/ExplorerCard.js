import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Share2, Download, Compass } from "lucide-react";
import CollectibleIcon from "./CollectibleIcon";

export default function ExplorerCard({ stats, collectibles, regionsTotal }) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const completed = stats?.completedCount || 0;
  const level = stats?.level?.title || "Musafir Baru";
  const highlights = (collectibles || []).slice(-4);

  const generate = async () => {
    const node = cardRef.current;
    return toPng(node, { cacheBust: true, pixelRatio: 2, backgroundColor: "#2b2620" });
  };

  const handleShare = async () => {
    try {
      setBusy(true);
      setMsg("");
      const dataUrl = await generate();
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "explorer-card-jelajah-nusa.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Explorer Card — Jelajah Nusa",
          text: `Aku sudah menjelajahi ${completed} wilayah Indonesia di Jelajah Nusa! Level: ${level}.`,
        });
        setMsg("Kartu dibagikan.");
      } else {
        downloadDataUrl(dataUrl);
        setMsg("Perangkat tidak mendukung berbagi langsung — kartu diunduh.");
      }
    } catch (e) {
      setMsg("Gagal membuat kartu. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    try {
      setBusy(true);
      setMsg("");
      const dataUrl = await generate();
      downloadDataUrl(dataUrl);
      setMsg("Kartu diunduh.");
    } catch (e) {
      setMsg("Gagal mengunduh kartu.");
    } finally {
      setBusy(false);
    }
  };

  const downloadDataUrl = (dataUrl) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "explorer-card-jelajah-nusa.png";
    a.click();
  };

  return (
    <div data-testid="explorer-card-section">
      {/* Card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl p-6 text-kertas"
        style={{ background: "#2b2620" }}
        data-testid="explorer-card"
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(193,39,45,0.5), transparent 70%)" }}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-merah">
              <Compass size={18} />
            </span>
            <span className="font-display text-lg font-bold">Jelajah Nusa</span>
          </div>
          <span className="stamp text-[10px] text-kertas/60">Explorer Card</span>
        </div>

        <div className="mt-6">
          <p className="stamp text-[11px] text-merah">Level Explorer</p>
          <p className="font-display text-3xl font-black">{level}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-kertas/15 bg-white/5 p-3">
            <p className="font-display text-4xl font-black">{completed}</p>
            <p className="text-xs text-kertas/70">dari {regionsTotal} wilayah</p>
          </div>
          <div className="rounded-xl border border-kertas/15 bg-white/5 p-3">
            <p className="font-display text-4xl font-black">{collectibles?.length || 0}</p>
            <p className="text-xs text-kertas/70">collectible terkumpul</p>
          </div>
        </div>

        {highlights.length > 0 && (
          <div className="mt-4 flex gap-2">
            {highlights.map((c) => (
              <span
                key={c.id}
                className="flex h-11 w-11 items-center justify-center rounded-lg"
                style={{ background: c.accent || "#c1272d" }}
                title={c.name}
              >
                <CollectibleIcon name={c.icon} size={20} />
              </span>
            ))}
          </div>
        )}

        <p className="mt-5 border-t border-kertas/15 pt-3 text-xs text-kertas/60">
          Kenali Indonesia. Satu cerita, satu perjalanan.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleShare}
          disabled={busy}
          data-testid="share-card-btn"
          className="inline-flex items-center gap-2 rounded-full bg-merah px-5 py-2.5 font-semibold text-white transition-soft hover:bg-merahdark disabled:opacity-60"
        >
          <Share2 size={17} /> Bagikan kartu
        </button>
        <button
          onClick={handleDownload}
          disabled={busy}
          data-testid="download-card-btn"
          className="inline-flex items-center gap-2 rounded-full border border-tinta/25 px-5 py-2.5 font-semibold text-tinta transition-soft hover:bg-kertas2 disabled:opacity-60"
        >
          <Download size={17} /> Unduh gambar
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-sepia" data-testid="card-msg">{msg}</p>}
    </div>
  );
}
