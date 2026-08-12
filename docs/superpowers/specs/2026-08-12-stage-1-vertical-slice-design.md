# Jelajah Nusa Stage 1 Vertical Slice Design

## Purpose

Stage 1 is an internal, backend-free demonstration of the full Jelajah Nusa loop for Aceh and Bali:

`Explore -> Story -> Choose -> Discover -> Collect -> Continue`

It must show that a user can understand the journey, finish a story, receive a collectible, and see the result in Nusa Passport. It does not validate aggregate product KPIs and does not include Supabase, Explorer Card, Suara Nusantara, level progression, or AI.

## Success Gate

After the internal demo is stable, eight mixed-age participants from the 13-24 target range each attempt one story without help. Stage 2A may begin when at least five reach the collectible.

This is a smoke test of general comprehension. The small mixed sample must not be used to claim fit for a specific age segment or persona.

## Architecture

Stage 1 is a client-only vertical slice with five modules:

1. **Landing** presents the editorial cover and routes to the map.
2. **Explore Map** presents Aceh and Bali as the only interactive provinces.
3. **Story Runner** renders structured story data and controls story transitions.
4. **Progress Store** owns all progress reads and writes, using browser storage with an in-memory fallback.
5. **Nusa Passport** renders progress and collectibles from the Progress Store.

UI components do not read or write browser storage directly. Story and collectible content is structured data, not component markup. Story URLs work when opened directly; the landing page is the normal entrance, not a navigation guard.

## Routes And Navigation

The route structure must support these destinations:

| Route | Purpose |
|---|---|
| `/` | Editorial landing cover |
| `/jelajah` | Indonesia map and equivalent province list |
| `/jelajah/:province` | Province intro and story runner for `aceh` or `bali` |
| `/passport` | Stage 1 Nusa Passport |

An unknown province slug displays a not-found state with a link back to `/jelajah`.

The normal journey is:

`Landing -> Map -> Province intro -> Story nodes -> Choice -> Branch node -> Discovery -> Collectible -> Passport or Map`

## Landing

The landing page always appears when `/` is opened, including repeat visits. It uses the approved editorial-cover direction:

- Label: `Jelajah Nusa · Catatan 01`
- Heading: `Satu cerita, satu perjalanan.`
- Body: `Pilih Aceh atau Bali. Ikuti ceritanya, tentukan pilihanmu, lalu simpan jejaknya di Nusa Passport.`
- Primary action: `Buka peta`

The map appears only as a visual hint on this page. There is one primary action and no onboarding carousel.

## Explore Map

The map shows the full Indonesian silhouette in a subdued treatment. Aceh and Bali are highlighted and are the only interactive map targets. Other provinces must not look locked, because they are not part of Stage 1.

A visible Aceh/Bali list appears below or beside the SVG. Its buttons share the same labels, status, and destinations as the map targets. The list is an equal interaction path, not screen-reader-only fallback content.

Each available province has one of three statuses:

- `not_started`
- `in_progress`
- `completed`

No province requires another province to be completed first.

## Story Experience

Each province has one story designed for a 2-5 minute session. The runner displays one node per screen with short text, an optional reviewed visual, visible navigation, and a stage indicator.

The stage indicator uses words rather than percentages:

- `Cerita`
- `Pilihan`
- `Penemuan`

Each Stage 1 story contains exactly one choice point with exactly two choices. Each choice leads to a distinct branch and a distinct Discovery. There are no wrong choices, blocked endings, or branch-specific collectibles.

## Resume, Reset, And Replay

Opening a story changes its province from `not_started` to `in_progress` and stores the current node.

When an unfinished story is opened again, the province intro offers:

- `Lanjutkan cerita`
- `Mulai dari awal`

Starting again clears the current node and latest choice for that province only. It does not change the other province.

Completed stories can be replayed to see the other Discovery. Replay follows these rules:

- Province status remains `completed`.
- Replay sets `currentNodeId` to the story's `startNodeId` but does not reset completion.
- The collectible is not duplicated.
- The latest choice may replace the saved latest choice.
- Every Discovery reached is retained in `seenDiscoveryIds`.

For an unfinished story, `Mulai dari awal` keeps the status `in_progress`, returns `currentNodeId` to `startNodeId`, and clears `latestChoiceId`. For a completed story, the equivalent action is replay and follows the rules above.

## Completion And Collectible

A story becomes complete when its Discovery is rendered. The Progress Store saves the completed status, Discovery, and province collectible before the collectible animation starts. Refreshing during or after that animation cannot lose or duplicate the reward.

Each province has exactly one collectible. Both choices award the same collectible.

## Nusa Passport

The Stage 1 Passport is deliberately small. It contains:

- Completed count from 0 to 2
- Aceh and Bali entries
- Story title and province status
- One stamp and collectible for each completed province
- Replay access for completed stories

Stage 1 has no explorer level, generated sharing card, or public profile.

## Content Contract

The implementation may use different type names, but the structured content must express this contract:

```ts
type ProvinceContent = {
  slug: 'aceh' | 'bali'
  name: string
  island: string
  mapPathId: string
  intro: string
  thumbnail: string
  story: Story
  discoveries: [Discovery, Discovery]
  collectible: Collectible
}

type Story = {
  title: string
  category: 'sejarah' | 'budaya' | 'tokoh' | 'kuliner' | 'bahasa'
  estimatedMinutes: string
  startNodeId: string
  nodes: StoryNode[]
}

type StoryNode = {
  id: string
  stage: 'story' | 'choice' | 'discovery'
  text: string
  image?: ReviewedAsset
  nextNodeId?: string
  choices?: [StoryChoice, StoryChoice]
  discoveryId?: string
}

type StoryChoice = {
  label: string
  nextNodeId: string
  discoveryId: string
}

type Discovery = {
  id: string
  title: string
  body: string
  sources: Source[]
  review: ContentReview
}

type Source = {
  label: string
  url: string
}

type ContentReview = {
  status: 'draft' | 'approved'
  reviewerRole: string
  reviewedAt?: string
}

type ReviewedAsset = {
  src: string
  alt: string
  review: ContentReview
}

type Collectible = {
  id: string
  name: string
  type: string
  description: string
  image: ReviewedAsset
}
```

Aceh and Bali content included during implementation is sample content until every Discovery source is visible and a relevant expert or local reviewer marks the content and cultural visual assets `approved`. Draft content must not be represented as publication-ready.

### Nonfinal Story Graph Examples

These examples fix the required graph shape without supplying unreviewed cultural claims or publication copy:

```text
aceh-opening
  -> aceh-context
  -> aceh-choice
     -> aceh-branch-a -> aceh-discovery-a
     -> aceh-branch-b -> aceh-discovery-b

bali-opening
  -> bali-context
  -> bali-choice
     -> bali-branch-a -> bali-discovery-a
     -> bali-branch-b -> bali-discovery-b
```

The final labels, narrative text, facts, sources, imagery, and collectible details require the content review described above. Implementers may use neutral sample text to exercise the graph, but sample text must be visibly marked as draft in non-production environments.

## Progress Contract

Local progress has a schema version and independent state per province:

```ts
type LocalProgress = {
  version: 1
  provinces: Partial<Record<'aceh' | 'bali', ProvinceProgress>>
}

type ProvinceProgress = {
  status: 'not_started' | 'in_progress' | 'completed'
  currentNodeId: string
  latestChoiceId?: string
  seenDiscoveryIds: string[]
  collectibleOwned: boolean
  updatedAt: string
}
```

The persisted value is untrusted input. The Progress Store validates the schema version, province keys, status, and referenced content IDs before exposing state to the UI. It ignores an invalid province entry when the other entry remains valid. If the whole value is unreadable, the app starts with empty progress.

## Storage Failure

If browser storage is unavailable, full, or throws an error, the Progress Store falls back to memory for the current page session. The journey remains usable and displays:

`Progres hanya tersimpan selama halaman ini terbuka.`

Storage failure must not block a story, choice, Discovery, or collectible.

## Error Handling

- An invalid province slug shows a not-found state and `Kembali ke peta`.
- A story with a missing node or invalid target stops safely, explains that the story cannot continue, and offers `Mulai dari awal`.
- A failed image leaves the text, controls, and story completion path usable.
- A failed external source does not reverse completion or remove a collectible.
- Progress parsing and migration errors never render a blank page.

## Accessibility And Responsive Behavior

- The full journey works at 360px viewport width and on desktop.
- Landing, map targets, province list, story controls, choices, and Passport work with keyboard alone.
- Every interactive element has an accessible name and visible focus state.
- The map has an accessible label, while the visible province list provides the equivalent navigation.
- Text and controls meet WCAG AA contrast.
- Story images have meaningful Indonesian alt text; decorative archival textures are hidden from assistive technology.
- Motion respects `prefers-reduced-motion`. Collectible completion cannot depend on animation.
- External source links clearly identify their destination and use safe external-link behavior.

## Visual Direction

The approved direction is modern Indonesian editorial:

- Editorial serif for headings and readable sans-serif for story text
- Red and white as accents, not full-page decoration
- Warm archival-paper base
- Passport and stamp motifs used for progress
- Regional motifs used only after cultural review

Story content retains visual priority over collection mechanics.

## Verification

### Content And Graph Tests

- Every province has one story, two Discoveries, and one collectible.
- Every Stage 1 choice node has exactly two choices.
- Node IDs are unique and every next-node reference exists.
- Both branches terminate at a sourced Discovery.
- Each Discovery and cultural asset exposes review metadata.

### Progress Tests

- Opening a story moves `not_started` to `in_progress`.
- Refresh resumes at the stored node.
- Reset affects only the selected province.
- Rendering Discovery atomically records completion and collectible ownership.
- Replay records another Discovery without duplicating the collectible.
- Invalid persisted data produces valid empty or partially recovered state.
- Storage failure switches to memory without blocking the journey.

### Component Tests

- Map and visible list navigate to the same province route.
- Story Runner renders the correct stage and two choices.
- Passport reflects progress from the Progress Store.
- Unknown slugs and invalid story graphs show recovery actions.

### End-To-End Tests

- Complete Aceh through each branch and retain both Discoveries.
- Refresh midway through a story and continue from the saved node.
- Replay a completed province without duplicating its collectible.
- Confirm Aceh reset or replay does not modify Bali progress.
- Complete the journey using keyboard controls at 360px width.
- Confirm reduced-motion mode does not hide completion feedback.

## Out Of Scope

- Supabase and anonymous authentication
- Cross-device progress
- Explorer levels
- Explorer Card and Web Share
- Suara Nusantara and moderation
- AI features
- More than Aceh and Bali
- CMS or admin interfaces
- Aggregate analytics or KPI claims
- Final publication of unreviewed cultural content
