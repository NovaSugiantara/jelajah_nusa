# Jelajah Nusa — PRD (living doc)

## Problem statement
Aplikasi edukasi interaktif untuk mengenal Indonesia lewat eksplorasi peta, cerita berbasis pilihan, dan koleksi.
Tagline: "Kenali Indonesia. Satu cerita, satu perjalanan."
Core loop: Explore → Story → Choose → Discover → Collect → Continue.

## Stack (implemented)
- Frontend: React (CRA) + Tailwind, react-router, lucide-react, html-to-image. Editorial Indonesian style (merah/putih, kertas arsip, stamp/passport).
- Backend: FastAPI + MongoDB (motor). All routes under /api.
- Progress: anonymous session via localStorage key `jelajah_nusa_session`, persisted in MongoDB `progress` collection.

## Personas
- Pelajar 13–24 (primer), Pendidik (sekunder), Wisatawan (tersier).

## Implemented (12 Aug 2026)
- 8 provinsi: Aceh, Sumatera Barat, DKI Jakarta, Yogyakarta, Bali, Kalimantan Barat, Sulawesi Selatan, Papua.
- Interactive map: REAL Indonesia GeoJSON (src/data/indonesia.json) via custom equirectangular projection in RegionMap.js; province outlines + 8 clickable target + status pins di centroid. Region cards.
- Audio Nusantara: procedural Web Audio ambient (src/lib/audio.js), profil musik berbeda per wilayah; toggle global Header (default off), mulai di story page, chime saat dapat collectible. Persist localStorage jn_sound_enabled.
- Story engine: scene → 1 decision (2 choices) → 2 sourced discoveries per region; collectible awarded regardless of choice (no duplicates).
- Progress tracking + explorer levels (0 Musafir Baru, 1 Penjelajah Muda, 2 Penjelajah, 4 Ahli, 6 Penjaga Cerita, 8 Duta Nusantara); milestones 2/4/6/8.
- Nusa Passport: stempel wilayah, koleksi, cerita ditemukan, level + milestones.
- Explorer Card: Web Share API + fallback PNG download (html-to-image).
- Suara Nusantara: submit anonim → pending (server-side), wall shows approved + seeded entries. Gated to users with ≥1 completion.
- Content stored as structured data in backend/content.py (not in UI).
- Tested: backend 11/11 pytest pass; frontend E2E core loop, passport, card, suara all pass.

## Backlog / Next
- P1: Moderator queue (Stage 2B) — approve/reject pending Suara Nusantara, protected by email magic-link auth (INTEGRATION required).
- P2: AI (opsional, non-blocking): moderasi otomatis Suara Nusantara + rekomendasi journey berikutnya (Emergent LLM key).
- P2: Konten richer — tambah node/percabangan (2–3 pilihan), review ahli/lokal per provinsi.
- P2: Aksesibilitas audit WCAG AA lengkap; alt/aria pada seluruh peta.

## Notes
- No auth/credentials in current build (anonymous). CORS wildcard OK (no cookies).
