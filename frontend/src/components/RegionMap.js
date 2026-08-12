import React, { useMemo, useState } from "react";
import indonesia from "../data/indonesia.json";

const STATE_BY_SLUG = {
  aceh: "Aceh",
  "sumatera-barat": "Sumatera Barat",
  "dki-jakarta": "Jakarta Raya",
  yogyakarta: "Yogyakarta",
  bali: "Bali",
  "kalimantan-barat": "Kalimantan Barat",
  "sulawesi-selatan": "Sulawesi Selatan",
  papua: "Papua",
};

const W = 1000;
const PAD = 26;

const STATUS_LABEL = {
  selesai: "Selesai",
  berlangsung: "Sedang dijelajahi",
  belum: "Belum dimulai",
};

// polygons(feature) -> array of rings (each ring = array of [lng,lat])
function polygonsOf(geom) {
  if (geom.type === "Polygon") return geom.coordinates;
  if (geom.type === "MultiPolygon") return geom.coordinates.flat();
  return [];
}

export default function RegionMap({ regions, statusOf, onSelect }) {
  const [hover, setHover] = useState(null);

  const regionByState = useMemo(() => {
    const map = {};
    regions.forEach((r) => {
      const st = STATE_BY_SLUG[r.slug];
      if (st) map[st] = r;
    });
    return map;
  }, [regions]);

  const { H, project, geo } = useMemo(() => {
    let lngMin = Infinity,
      lngMax = -Infinity,
      latMin = Infinity,
      latMax = -Infinity;
    indonesia.features.forEach((f) => {
      polygonsOf(f.geometry).forEach((ring) =>
        ring.forEach(([lng, lat]) => {
          if (lng < lngMin) lngMin = lng;
          if (lng > lngMax) lngMax = lng;
          if (lat < latMin) latMin = lat;
          if (lat > latMax) latMax = lat;
        })
      );
    });
    const scale = (W - 2 * PAD) / (lngMax - lngMin);
    const height = (latMax - latMin) * scale + 2 * PAD;
    const project = ([lng, lat]) => [
      PAD + (lng - lngMin) * scale,
      PAD + (latMax - lat) * scale,
    ];
    return { H: height, project, geo: indonesia };
  }, []);

  const { features, centroids } = useMemo(() => {
    const feats = geo.features.map((f, i) => {
      const rings = polygonsOf(f.geometry);
      const d = rings
        .map((ring) => {
          const pts = ring.map(project);
          return (
            "M" +
            pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L") +
            "Z"
          );
        })
        .join(" ");
      return { i, state: f.properties.state, d, rings };
    });

    const cents = {};
    feats.forEach((f) => {
      const r = regionByState[f.state];
      if (!r) return;
      // centroid = average of the largest ring's projected points
      let largest = f.rings[0] || [];
      f.rings.forEach((ring) => {
        if (ring.length > largest.length) largest = ring;
      });
      const pts = largest.map(project);
      const sum = pts.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]);
      cents[f.state] = [sum[0] / pts.length, sum[1] / pts.length];
    });
    return { features: feats, centroids: cents };
  }, [geo, project, regionByState]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl arsip-card shadow-arsip" data-testid="indonesia-map">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Peta Indonesia dengan wilayah yang dapat dijelajahi">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0 L0 0 0 30" fill="none" stroke="#6b5b47" strokeWidth="0.4" opacity="0.1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={W} height={H} fill="url(#grid)" />

        {/* base provinces */}
        {features.map((f) => {
          const r = regionByState[f.state];
          if (!r) {
            return <path key={f.i} d={f.d} fill="#e6dcc4" stroke="#cbbb99" strokeWidth="0.6" opacity="0.85" />;
          }
          const status = statusOf(r.slug);
          const isDone = status === "selesai";
          const isActive = status === "berlangsung";
          const fill = isDone ? r.accent : isActive ? "rgba(193,39,45,0.28)" : "#f4ecda";
          const isHover = hover === r.slug;
          return (
            <path
              key={f.i}
              d={f.d}
              fill={fill}
              stroke={isDone ? r.accent : isActive ? "#c1272d" : "#9c8560"}
              strokeWidth={isHover ? 2.2 : 1.3}
              className="cursor-pointer transition-soft"
              style={{ filter: isHover ? "brightness(1.06)" : "none" }}
              onClick={() => onSelect(r.slug)}
              onMouseEnter={() => setHover(r.slug)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}

        {/* pins */}
        {regions.map((r) => {
          const st = STATE_BY_SLUG[r.slug];
          const c = centroids[st];
          if (!c || Number.isNaN(c[0])) return null;
          const [cx, cy] = c;
          const status = statusOf(r.slug);
          const isDone = status === "selesai";
          const isActive = status === "berlangsung";
          const fill = isDone ? "#ffffff" : isActive ? "#c1272d" : "#f5efe3";
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
              aria-label={`${r.name} — ${STATUS_LABEL[status]}`}
              data-testid={`map-pin-${r.slug}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(r.slug);
                }
              }}
            >
              {isActive && (
                <circle cx={cx} cy={cy} r="12" fill="#c1272d" opacity="0.18">
                  <animate attributeName="r" values="8;15;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.28;0.04;0.28" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r="7" fill={fill} stroke={stroke} strokeWidth="2.2" />
              {isDone ? (
                <path
                  d={`M${cx - 3.2},${cy} l2.2,2.2 l4.3,-4.7`}
                  fill="none"
                  stroke={r.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <circle cx={cx} cy={cy} r="2.2" fill={stroke} />
              )}

              {hover === r.slug && (
                <g pointerEvents="none">
                  <rect x={cx - 58} y={cy - 40} width="116" height="24" rx="6" fill="#2b2620" />
                  <text x={cx} y={cy - 24} textAnchor="middle" fontSize="12" fill="#f5efe3" fontWeight="600">
                    {r.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

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
