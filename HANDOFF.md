# Daily Digest — Handoff Document

**Last updated:** 2026-04-22  
**Owner:** Iura Osadchuk  
**Live site:** https://iura-daily-digest.vercel.app

---

## Architecture Overview

```
[CCR Morning Agent — 8:00 AM Madrid / 6:00 AM UTC]
    │
    ├─ WebSearch × 9 topics (last 24h)
    ├─ Paywall filter (hard rule — see §6)
    ├─ Build Digest JSON
    ├─ git clone iurche/iura-daily-digest
    ├─ Write content/digests/YYYY-MM-DD.json
    ├─ git commit + git push origin main
    │       └─ Vercel auto-build triggered
    └─ Telegram notification → @iurasclaude_bot
```

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS · Zustand · Vercel  
**Content store:** JSON files in `/content/digests/YYYY-MM-DD.json` — no database  
**Shelf state:** `localStorage` — stores full Story objects, not just IDs

---

## 1. JSON Schema

The morning pipeline must write files that exactly match this schema.

### `Digest` (top-level file)
```ts
{
  date: string;          // YYYY-MM-DD
  heroStoryId: string;   // Must match the id of a story in stories[] where isHero: true
  stories: Story[];
}
```

### `Story`
```ts
{
  id: string;            // "{date}-{topic}-{index}" e.g. "2026-04-21-ai-tools-2"
  topic: Topic;          // Exact slug — see valid values below
  headline: string;      // Article title, max ~120 chars
  dek: string;           // 1–2 sentence editorial summary
  source: string;        // Display name of publication e.g. "The Guardian"
  sourceUrl: string;     // Direct article URL — must be free, no paywall
  imageUrl?: string;     // Optional. Unsplash URL. Falls back to Pexels if null.
  imageCredit?: string;  // Optional. "Photo by Name on Unsplash"
  isHero?: boolean;      // true on exactly one story per digest (first product-design story)
  publishedAt: string;   // ISO 8601 e.g. "2026-04-21T08:00:00.000Z"
}
```

### Valid `Topic` slugs
```
product-design | ux-research | ai-tools | ai-research |
iot-hardware   | aiot        | smart-agriculture | career-signals | in-the-world
```

---

## 2. Infrastructure

| Resource | Value |
|---|---|
| Live site | https://iura-daily-digest.vercel.app |
| GitHub repo | https://github.com/iurche/iura-daily-digest (private) |
| Vercel project | https://vercel.com/iurches-projects/iura-daily-digest |
| Vercel project ID | `prj_8qAe7bjzbNCE4JeAxctZ4XERGV7q` |
| Vercel team ID | `team_hFg1AbJcnmTpl80fMp9B67g1` |
| CCR trigger | https://claude.ai/code/scheduled/trig_01GbKbhfBPM3s5zTM2xvFNJH |
| Trigger name | Iura Daily Digest v5 |
| Cron | `0 6 * * *` (06:00 UTC = 08:00 Madrid) |
| Telegram bot | @iurasclaude_bot · chat_id `382160671` |

---

## 3. Routes

| Route | Description | Caching |
|---|---|---|
| `/` | Today's digest (latest JSON) | SSG |
| `/topic/[slug]` | All stories for a topic | SSG (pre-rendered) |
| `/shelf` | Saved stories from localStorage | Client-only |
| `/api/stories` | Flat JSON of all stories | Dynamic |

---

## 4. Components

| Component | Purpose |
|---|---|
| `Nav` | Fixed header with logo, date, topic pills (desktop), dropdown (mobile), Shelf button, theme toggle |
| `Hero` | Full-bleed hero story with gradient overlay |
| `StoryCard` | Image-top card used in topic grids |
| `TopicSection` | Section header + responsive StoryCard grid (1/2/3 columns) |
| `SaveButton` | Bookmark toggle with particle animation |
| `Toast` | Notification popup for save/unsave actions |
| `Footer` | Dynamic date, links |

### Responsive Breakpoints
- Mobile: 1 column grid, topic dropdown
- Tablet (md): 2 columns
- Desktop (lg): 3 columns, inline topic pills

---

## 5. Navigation

**Desktop (sm+):** Inline horizontal pills showing all 8 topics
**Mobile:** Dropdown menu with "Topics" button

Current topics in nav order:
1. All (homepage)
2. Product Design
3. UX Research
4. AI Tools
5. AI Research
6. IoT & Hardware
7. AIoT
8. Smart Agriculture
9. Career Signals
10. In The World

---

## 6. Shelf (Saved Stories)

- Full Story objects stored in `localStorage` key `dd-shelf` as JSON array
- Persists across days (not lost when stories rotate out of today's feed)
- Export to Markdown available on shelf page

---

## 7. Theme

- Dark mode (default): `--bg: #0A0A0A`, `--brand: #049EE2` (cyan)
- Light mode: toggle in nav
- CSS variables in `app/globals.css`

---

## 8. Imagery

**Image priority:**
1. `story.imageUrl` from JSON (Unsplash)
2. Pexels fallback via `/api/pexels-image?q={query}` route
3. No image if both fail

**Pexels API:** Key stored in Vercel env var `PEXELS_API_KEY`

---

## 9. Local Dev

```bash
pnpm install
pnpm dev
```

---

## 10. Deploy

```bash
git add -A
git commit -m "message"
git push origin main
# Vercel auto-deploys
```

Or manually:
```bash
npx vercel --prod --yes
```
