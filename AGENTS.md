# Jelajah Nusa Agent Notes

## Repository State

- This repository currently contains product documentation only; there is no app scaffold, package manifest, CI, or executable test/lint/build command yet.
- Nuxt 4 and Supabase are the planned stack in `docs/SRS.md`, not an initialized or verified toolchain. Do not invent commands or dependencies before scaffolding exists.
- Read `docs/PRD.md` for scope, `docs/SRS.md` for functional/data/security requirements, and `docs/DESIGN.md` for UX and visual direction. Treat executable config as authoritative once it is added.

## Product Guardrails

- Preserve the core loop: Explore -> Story -> Choose -> Discover -> Collect -> Continue.
- Ship in stages: Stage 1 is an internal Aceh/Bali demo. Test 4 participants per province on their own phones; Stage 2A starts only if at least 5/8 total and 2/4 per province reach a collectible without facilitator guidance. Stage 2B adds the moderated community wall.
- Use provinces as the consistent map/content unit. Every available province is selectable from the start; do not add locked progression.
- Each province needs one 2-5 minute story, one decision with 2-3 choices, a sourced Discovery per branch, and exactly one province collectible. Stage 1 uses exactly 2 choices per story.
- Choices change the Discovery, not the collectible; no choice may block completion as a "wrong" answer.
- Keep story and collectible content in structured data, not embedded in UI components.
- AI is optional and non-blocking; do not make the core journey depend on it.
- The primary UI language is Bahasa Indonesia. Use a warm, personal `kamu` voice that educates without stereotyping or lecturing; cultural claims require credible sources and sensitivity review.

## Experience Constraints

- Build mobile-first for 360px and wider while preserving desktop usability; the map must remain readable, labeled, and tappable.
- Follow the modern Indonesian editorial direction: map-centered exploration, red/white accents, archival paper/passport/stamp motifs, and region-specific collectibles. Story comes before gamification.
- Stage 1 stores progress locally and has no backend or aggregate KPI claim. Stage 2A introduces Supabase anonymous progress and Explorer Card sharing through Web Share with image-download fallback; do not add public share links.
- Stage 2B stores Suara Nusantara submissions without profile identity and as `pending` by default. Only moderator-approved entries become public; protect the preview/approve/reject queue with email magic link and a moderator role.
- Supabase user progress must be isolated with RLS. Validate Suara Nusantara submissions server-side before storage or moderation.
- Cultural content requires visible sources per Discovery and approval from a relevant expert/local reviewer before publication.
- Meet WCAG AA contrast and provide accessible alternatives/labels for map regions and interactions.

## Scope Check

- Do not add a CMS, general admin dashboard, multiplayer, full PWA/offline mode, formal curriculum integration, social login, or more than 8 provinces unless requirements explicitly change. The Stage 2B moderation queue is the sole narrow admin exception.
- When requirements conflict, preserve the MVP priorities in `docs/PRD.md`; update the relevant product document alongside an intentional scope change.
