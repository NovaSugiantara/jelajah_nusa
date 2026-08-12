import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #c1272d, transparent 70%)" }}
      />
      <div className="mx-auto max-w-2xl px-6 pb-28 pt-16 text-center md:pt-24">
        <p className="stamp text-[11px] text-merah">Jelajah Nusa · Catatan 01</p>
        <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] tracking-tight text-tinta md:text-6xl">
          Satu cerita,
          <br />
          satu perjalanan.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-tinta/75">
          Pilih Aceh atau Bali. Ikuti ceritanya, tentukan pilihanmu, lalu simpan jejaknya di Nusa Passport.
        </p>
        <button
          onClick={() => navigate("/jelajah")}
          data-testid="landing-explore-btn"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-merah px-8 py-4 font-semibold text-white shadow-arsip transition-soft hover:bg-merahdark"
        >
          Buka peta
          <ArrowRight size={18} className="transition-soft group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
