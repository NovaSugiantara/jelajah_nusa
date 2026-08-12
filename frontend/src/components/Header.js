import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Map, BookMarked, MessagesSquare, Compass, Volume2, VolumeX } from "lucide-react";
import audioEngine from "../lib/audio";

const links = [
  { to: "/", label: "Peta", icon: Map, testid: "nav-peta" },
  { to: "/passport", label: "Nusa Passport", icon: BookMarked, testid: "nav-passport" },
  { to: "/suara", label: "Suara Nusantara", icon: MessagesSquare, testid: "nav-suara" },
];

function SoundToggle() {
  const [on, setOn] = useState(audioEngine.isEnabled());
  useEffect(() => audioEngine.subscribe(setOn), []);
  return (
    <button
      onClick={() => audioEngine.setEnabled(!on)}
      data-testid="sound-toggle"
      aria-label={on ? "Matikan Suara Nusantara" : "Nyalakan Suara Nusantara"}
      title={on ? "Suara aktif" : "Suara mati"}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-soft ${
        on ? "bg-merah text-white" : "text-tinta/70 hover:bg-kertas2"
      }`}
    >
      {on ? <Volume2 size={17} /> : <VolumeX size={17} />}
    </button>
  );
}

export default function Header() {
  const loc = useLocation();
  return (
    <header
      className="sticky top-0 z-40 border-b border-sepia/25 backdrop-blur-md"
      style={{ background: "rgba(245,239,227,0.82)" }}
      data-testid="app-header"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 group" data-testid="brand-link">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-merah text-white transition-soft group-hover:rotate-12">
            <Compass size={20} strokeWidth={2.2} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-extrabold tracking-tight text-tinta">
              Jelajah Nusa
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-sepia sm:block">
              Kenali Indonesia
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active = loc.pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={l.testid}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-soft ${
                  active
                    ? "bg-tinta text-kertas"
                    : "text-tinta/80 hover:bg-kertas2"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
          <SoundToggle />
        </nav>
      </div>
    </header>
  );
}
