import React, { useState } from "react";

// Stylized, editorial silhouette of the Indonesian archipelago (decorative, not geographic-exact).
const ISLANDS = [
  // Sumatra
  "M70,70 C120,55 150,95 165,140 C185,190 210,220 205,255 C200,285 165,285 150,255 C130,215 110,205 95,165 C78,120 45,95 70,70 Z",
  // Kalimantan
  "M360,150 C420,120 500,120 545,150 C585,178 585,235 555,270 C520,305 455,310 410,290 C365,270 335,225 345,190 C349,172 350,158 360,150 Z",
  // Java
  "M300,360 C360,342 470,344 560,352 C610,356 615,382 560,388 C470,398 360,398 305,386 C278,380 275,368 300,360 Z",
  // Bali & Nusa Tenggara (dots)
  "M600,372 C612,366 626,368 632,376 C636,384 626,390 614,388 C604,386 592,380 600,372 Z",
  "M652,374 C664,368 682,372 686,380 C688,388 674,392 662,388 C654,385 646,380 652,374 Z",
  // Sulawesi
  "M600,175 C630,165 648,190 640,220 C660,235 665,270 640,295 C625,308 612,292 618,270 C600,262 585,240 598,222 C582,210 585,188 600,175 Z",
  // Papua
  "M800,215 C860,195 930,205 955,235 C975,262 950,300 905,308 C860,316 815,305 800,280 C788,262 782,232 800,215 Z",
];

const ISLAND_LABELS = [
  { name: "Sumatra", x: 90, y: 300 },
  { name: "Kalimantan", x: 430, y: 330 },
  { name: "Jawa", x: 400, y: 418 },
  { name: "Sulawesi", x: 640, y: 330 },
  { name: "Papua", x: 875, y: 345 },
];

const STATUS_MAP = {
  selesai: { label: "Selesai" },
  berlangsung: { label: "Sedang dijelajahi" },
  belum: { label: "Belum dimulai" },
};

export default function RegionMap({ regions, statusOf, onSelect }) {
  const [hover, setHover] = useState(null);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl arsip-card shadow-arsip" data-testid="indonesia-map">
      <svg viewBox="0 0 1000 480" className="w-full" role="img" aria-label="Peta Indonesia dengan wilayah yang dapat dijelajahi">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0 L0 0 0 28" fill="none" stroke="#6b5b47" strokeWidth="0.4" opacity="0.12" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="1000" height="480" fill="url(#grid)" />

        {/* dotted connecting lines across the archipelago */}
        <path
          d="M60,150 C250,120 380,200 470,220 C600,250 700,240 880,260"
          fill="none"
          stroke="#c1272d"
          strokeWidth="1.6"
          className="dotted-path"
          opacity="0.5"
        />

        {/* island silhouettes */}
        {ISLANDS.map((d, i) => (
          <path key={i} d={d} fill="#e3d6bb" stroke="#b6a284" strokeWidth="1.4" />
        ))}

        {ISLAND_LABELS.map((l) => (
          <text
            key={l.name}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            className="stamp"
            fontSize="12"
            fill="#8a7860"
            style={{ letterSpacing: "0.15em" }}
          >
            {l.name}
          </text>
        ))}

        {/* region pins */}
        {regions.map((r) => {
          const cx = (r.map.x / 100) * 1000;
          const cy = (r.map.y / 100) * 480;
          const status = statusOf(r.slug);
          const isDone = status === "selesai";
          const isActive = status === "berlangsung";
          const fill = isDone ? r.accent : isActive ? "#c1272d" : "#f5efe3";
          const stroke = isDone ? r.accent : isActive ? "#c1272d" : "#8a7860";
          return (
            <g
              key={r.slug}
              className="map-dot cursor-pointer"
              onClick={() => onSelect(r.slug)}
              onMouseEnter={() => setHover(r.slug)}
              onMouseLeave={() => setHover(null)}
              role="button"
              tabIndex={0}
              aria-label={`${r.name} — ${STATUS_MAP[status].label}`}
              data-testid={`map-pin-${r.slug}`}
              onKeyDown={(e) => e.key === "Enter" && onSelect(r.slug)}
            >
              {isActive && (
                <circle cx={cx} cy={cy} r="16" fill="#c1272d" opacity="0.18">
                  <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.28;0.05;0.28" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r="10" fill={fill} stroke={stroke} strokeWidth="2.5" />
              {isDone && (
                <path
                  d={`M${cx - 4.5},${cy} l3,3 l6,-6.5`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {!isDone && !isActive && <circle cx={cx} cy={cy} r="3" fill="#8a7860" />}

              {(hover === r.slug) && (
                <g pointerEvents="none">
                  <rect
                    x={cx - 62}
                    y={cy - 46}
                    width="124"
                    height="28"
                    rx="6"
                    fill="#2b2620"
                  />
                  <text x={cx} y={cy - 27} textAnchor="middle" fontSize="13" fill="#f5efe3" fontWeight="600">
                    {r.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-sepia/20 px-4 py-3 text-xs text-sepia">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-sepia bg-kertas" /> Belum dimulai
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-merah bg-merah/20" /> Sedang dijelajahi
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-emas" /> Selesai
        </span>
      </div>
    </div>
  );
}
