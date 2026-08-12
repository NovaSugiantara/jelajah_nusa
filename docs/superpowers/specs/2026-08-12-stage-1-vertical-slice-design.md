# Jelajah Nusa Stage 1 Vertical Slice Design

## Purpose

Stage 1 is an internal FARM-stack demonstration of the full Jelajah Nusa loop for Aceh and Bali:

`Explore -> Story -> Choose -> Discover -> Collect -> Continue`

It must show that a user can understand the journey, finish a story, receive a collectible, and see the result in Nusa Passport. It uses React, FastAPI, and MongoDB Atlas from the start. It does not validate aggregate product KPIs and does not include Explorer Card, Suara Nusantara, level progression, or AI.

## Success Gate

After the internal demo is stable, eight mixed-age participants from the 13-24 target range each attempt one story on their own phone. Four receive Aceh and four receive Bali. Every participant starts at the landing page. Facilitators may observe and resolve a recorded technical failure, but may not point out controls, explain the journey, or otherwise help the participant advance.

Stage 2A may begin when at least five of eight participants reach the collectible, with at least two of four succeeding for each province.

This is a smoke test of general comprehension. The small mixed sample must not be used to claim fit for a specific age segment or persona.

## Architecture

Stage 1 is a FARM vertical slice with six modules:

1. **Landing** presents the editorial cover and routes to the map.
2. **Explore Map** presents Aceh and Bali as the only interactive provinces.
3. **Story Runner** renders structured story data from FastAPI and requests validated story transitions.
4. **FastAPI** owns content delivery, anonymous sessions, graph validation, and progress transitions.
5. **MongoDB Atlas** stores content, hashed sessions, and progress.
6. **Nusa Passport** renders progress returned by FastAPI.

React components do not mutate progress directly. They send transition intent to FastAPI and update the screen only after the API returns the committed progress. Story and collectible content is structured data in MongoDB, not component markup. Story URLs work when opened directly; the landing page is the normal entrance, not a navigation guard.

## Anonymous Session

FastAPI creates an anonymous session on the first request that needs identity. The browser receives an opaque random token in a cookie configured `HttpOnly`, `Secure`, `SameSite=Lax`, and `Path=/`. MongoDB stores only a hash of the token with `createdAt`, `lastSeenAt`, and `expiresAt`. React and FastAPI are deployed same-origin when possible; FastAPI rejects unapproved origins on state-changing requests.

The session expires after 30 days without activity. Valid activity refreshes `lastSeenAt` and `expiresAt`. FastAPI derives identity from the cookie on every progress request and never trusts a user or session ID supplied in the JSON body, query string, or route.

MongoDB enforces unique indexes on `sessions.tokenHash` and `progress.sessionId`, plus TTL indexes on both collections' `expiresAt`. FastAPI refreshes both expiry values on valid session activity. Expired documents may be deleted asynchronously by MongoDB; FastAPI still rejects any session whose `expiresAt` is in the past.

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

Completion and the active run are separate state. A completed province with a replay in progress remains visually `completed` and adds the secondary label `Cerita ulang berlangsung` with an action to continue the replay.

## Story Experience

Each province has one story designed for a 2-5 minute session. The runner displays one node per screen with short text, an optional reviewed visual, visible navigation, and a stage indicator. Story screens include a `Kembali` action. The active run stores node history so a user can reread earlier nodes.

The stage indicator uses words rather than percentages:

- `Cerita`
- `Pilihan`
- `Penemuan`

Each Stage 1 story contains exactly one choice point with exactly two choices. Each choice leads to a distinct branch and a distinct Discovery. There are no wrong choices, blocked endings, or branch-specific collectibles.

After a choice is selected, it is locked for that run. Going back may revisit earlier text but may not change the selected branch. When history returns to the choice node, the selected option is shown as locked and `Lanjutkan pilihan` follows its saved edge. A user changes the choice only by starting an unfinished story again or replaying a completed story.

## Resume, Reset, And Replay

Opening a story requests FastAPI to create an active run and derives the province status `in_progress`. A province with no progress entry is `not_started`; `not_started` is not persisted as a second representation.

When an unfinished story is opened again, the province intro offers:

- `Lanjutkan cerita`
- `Mulai dari awal`

Starting again resets the active run for that province only. It does not change completion data, any Discovery already seen, or the other province.

Completed stories can be replayed to see the other Discovery. Replay follows these rules:

- Completion remains recorded.
- Replay creates a new active run at the story's `startNodeId`.
- The collectible is not duplicated.
- The replay run stores its own latest choice.
- Every Discovery reached is retained in `seenDiscoveryIds`.

For an unfinished story, `Mulai dari awal` replaces the active run with a fresh run at `startNodeId`. For a completed story, the equivalent action is replay and follows the rules above.

## Completion And Collectible

A story becomes complete during the validated state transition into its Discovery node. FastAPI validates the current session, active run, selected graph edge, and target node, then atomically saves completion, `lastDiscoveryId`, the seen Discovery, and province collectible and clears the finished active run before React renders Discovery or starts the collectible animation. Rendering a component never causes the completion mutation. Refreshing on the Discovery restores `lastDiscoveryId` without replaying the reward animation; retrying the transition cannot lose or duplicate the reward.

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
  thumbnail: ReviewedAsset
  story: Story
  discoveries: [Discovery, Discovery]
  collectible: Collectible
}

type Story = {
  title: string
  category: 'sejarah' | 'budaya' | 'tokoh' | 'kuliner' | 'bahasa'
  estimatedMinutes: [2, 5]
  startNodeId: string
  nodes: StoryNode[]
}

type StoryNode = StoryTextNode | StoryChoiceNode | StoryDiscoveryNode

type StoryTextNode = {
  id: string
  stage: 'story'
  text: string
  image?: ReviewedAsset
  nextNodeId: string
}

type StoryChoiceNode = {
  id: string
  stage: 'choice'
  text: string
  image?: ReviewedAsset
  choices: [StoryChoice, StoryChoice]
}

type StoryDiscoveryNode = {
  id: string
  stage: 'discovery'
  text: string
  discoveryId: string
}

type StoryChoice = {
  id: string
  label: string
  nextNodeId: string
}

type Discovery = {
  id: string
  title: string
  body: string
  sources: [Source, ...Source[]]
  review: ContentReview
}

type Source = {
  label: string
  url: string
}

type ContentReview =
  | { status: 'draft' }
  | {
      status: 'approved'
      reviewedAt: string
      reviewRecordId: string
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

Aceh and Bali content included during implementation is sample content until every Discovery source is visible and a relevant expert or local reviewer marks the content and cultural visual assets `approved`. An approved item requires `reviewedAt` and `reviewRecordId`; a draft item must omit both. Draft content must not be represented as publication-ready.

Each `reviewRecordId` refers to a record that is not shipped in the public application bundle. It contains no reviewer PII and captures an internal reviewer ID, the reviewer's relevant capacity, the reviewed content or asset IDs, and the decision date. Public application data does not expose reviewer identity without separate consent.

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

MongoDB progress has a schema version, belongs to the server-derived session identity, and stores independent state per province:

```ts
type UserProgress = {
  version: 1
  sessionId: string
  provinces: Partial<Record<'aceh' | 'bali', ProvinceProgress>>
  expiresAt: string
}

type ProvinceProgress = {
  activeRun?: ActiveRun
  completedAt?: string
  lastDiscoveryId?: string
  seenDiscoveryIds: string[]
  collectibleOwned: boolean
  updatedAt: string
}

type ActiveRun = {
  currentNodeId: string
  nodeHistory: string[]
  latestChoiceId?: string
}
```

No province entry means `not_started`. An entry with an active run and no `completedAt` is `in_progress`. An entry with `completedAt` is `completed`, whether or not a replay run is active.

A valid province entry satisfies these invariants:

- It has an `activeRun`, a `completedAt`, or both; an empty entry is invalid.
- `collectibleOwned` is `true` if and only if `completedAt` exists.
- A completed entry has a valid `lastDiscoveryId`, and that ID appears in `seenDiscoveryIds`.
- `currentNodeId`, every `nodeHistory` item, `latestChoiceId`, and every seen Discovery refer to the same province's current content graph.
- Finishing either an initial run or replay clears `activeRun`; a later replay creates a new one.

FastAPI validates schema version 1, province keys, timestamps, booleans, and all referenced content IDs before returning progress. Within version 1, it ignores an invalid province entry when the other entry remains valid and returns a recovery notice: `Sebagian progres tidak dapat dipulihkan.` An unknown schema version returns empty progress for the session; cross-version salvage is forbidden until an explicit migration exists.

Stage 1 uses three collections: `content`, `sessions`, and `progress`. Each province is one `content` document with its story graph, Discoveries, review metadata, and collectible embedded. Each session has at most one `progress` document, so completion, Discovery, collectible, and active-run changes use one atomic document update. Progress expires with its anonymous session.

## API Contract

The Stage 1 API needs only these capabilities:

- Fetch Aceh/Bali content allowed in the current environment. Production serves only `approved` content; the internal demo may serve visibly marked drafts.
- Fetch progress for the current anonymous session.
- Start or reset a province run.
- Move backward through saved history.
- Submit a forward transition or choice against the current run.
- Start a replay for a completed province.

Every mutation returns the committed progress and current node. Mutation requests include the expected current node so FastAPI can reject stale or repeated transitions safely. Completion and collectible writes are idempotent.

## API Failure

React keeps the current node visible and disables duplicate submission while a progress mutation is pending. It moves to the next node only after FastAPI confirms the write. On timeout, network error, or server rejection, it shows `Progres belum tersimpan. Coba lagi.` with `Coba lagi` and does not advance locally.

Stage 1 has no offline queue, optimistic transition, browser progress mirror, or local fallback. A content API failure shows a retry state and does not render a partial story graph.

## Error Handling

- An invalid province slug shows a not-found state and `Kembali ke peta`.
- A story with a missing node or invalid target stops safely with `Cerita ini belum bisa dilanjutkan.` and always offers `Kembali ke peta`. It offers `Mulai dari awal` only when the start node and initial path validate successfully.
- A failed image leaves the text, controls, and story completion path usable.
- A failed external source does not reverse completion or remove a collectible.
- Progress or API recovery errors never render a blank page.

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
- Every source collection contains at least one valid external URL.
- Approved content and assets reference a complete internal review record.
- Province thumbnails use the same reviewed-asset contract as story and collectible images.

### Progress Tests

- Opening a story through FastAPI creates an active run scoped to the anonymous session and derives `in_progress`.
- Refresh resumes at the stored node.
- Back navigation follows `nodeHistory` without unlocking a selected choice.
- Reset affects only the selected province.
- A validated transition into Discovery atomically records completion and collectible ownership before render.
- Completion clears the finished active run; replay creates a new run and clears it at the next Discovery.
- Refresh on Discovery restores `lastDiscoveryId` without replaying the collectible animation.
- Replay records another Discovery without duplicating the collectible.
- A completed province with an active replay remains completed and exposes replay state separately.
- Invalid MongoDB progress produces valid empty or partially recovered state.
- An unknown schema version produces empty progress rather than cross-version salvage.
- A failed mutation leaves React on the current node and retry commits exactly once.
- A client-supplied session or user ID cannot access another session's progress.
- Expired sessions and requests from unapproved origins cannot mutate progress.

### API And Database Tests

- A first progress request creates one anonymous session cookie and stores only its token hash.
- Reusing the cookie returns the same session progress; omitting it creates a different session.
- Session and progress expiry move together after valid activity, and expired sessions are rejected even before TTL cleanup runs.
- Content responses exclude draft records in production and include visibly marked drafts only in the internal-demo environment.
- Concurrent or repeated completion requests produce one completion and one collectible.
- Content, progress, and error responses satisfy the documented JSON contract.

### Component Tests

- Map and visible list navigate to the same province route.
- Story Runner renders the correct stage and two choices.
- Passport reflects progress returned by FastAPI.
- Unknown slugs and invalid story graphs show recovery actions.

### End-To-End Tests

- Complete each Aceh branch independently from clean progress.
- Complete each Bali branch independently from clean progress.
- Complete one branch, replay, and retain both Discoveries without duplicating the collectible.
- Refresh midway through a story and continue from the saved node.
- Replay a completed province without duplicating its collectible.
- Confirm Aceh reset or replay does not modify Bali progress.
- Complete the journey using keyboard controls at 360px width.
- Confirm reduced-motion mode does not hide completion feedback.

### Facilitated Gate Protocol

- Recruit eight participants aged 13-24 and record age, phone model, browser, assigned province, completion outcome, technical failures, and any facilitator intervention.
- Assign four participants to Aceh and four to Bali before each session.
- Start every participant at `/` on their own phone with a fresh anonymous session and empty server progress.
- Give only the neutral task: `Pilih provinsi yang diberikan dan selesaikan perjalanannya.`
- Do not point out controls, explain choices, or tell the participant what to press.
- Count success only when the participant reaches the collectible without guidance. Record technical assistance separately and do not count an assisted run as unassisted success.
- Pass the gate only when total success is at least 5/8 and each province reaches at least 2/4.

## Out Of Scope

- Registered user accounts or social login
- Cross-device progress
- Explorer levels
- Explorer Card and Web Share
- Suara Nusantara and moderation
- AI features
- More than Aceh and Bali
- CMS or admin interfaces
- Aggregate analytics or KPI claims
- Final publication of unreviewed cultural content
- Offline mode or local progress fallback
