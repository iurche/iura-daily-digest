# Daily Digest — Handoff Document

**Last updated:** 2026-04-21  
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
    │               └─ ISR revalidate=3600
    └─ Telegram notification → @iurasclaude_bot
```

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS · Zustand · Vercel  
**Content store:** JSON files in `/content/digests/YYYY-MM-DD.json` — no database  
**Shelf state:** `localStorage` only — no auth, no server state

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
  imageUrl?: string;     // Optional. Unsplash URL or local path. Falls back to Picsum if null.
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

### Example minimal valid file
```json
{
  "date": "2026-04-21",
  "heroStoryId": "2026-04-21-product-design-0",
  "stories": [
    {
      "id": "2026-04-21-product-design-0",
      "topic": "product-design",
      "headline": "Example Headline",
      "dek": "One or two sentence summary of the story.",
      "source": "Wired",
      "sourceUrl": "https://www.wired.com/story/example",
      "imageUrl": null,
      "publishedAt": "2026-04-21T08:00:00.000Z",
      "isHero": true
    }
  ]
}
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

## 3. Required Environment Variables

Set in `.env.local` for local dev. Set in Vercel project dashboard for production.

| Variable | Purpose | Required now? |
|---|---|---|
| `UNSPLASH_ACCESS_KEY` | Fetch per-story photos from Unsplash | Optional — Picsum fallback active |
| `GEMINI_API_KEY` | Generate daily hero illustration | Optional — no hero image without it |
| `GUARDIAN_API_KEY` | Guardian Open Platform for In the World | Optional — WebSearch fallback in CCR trigger |
| `VERCEL_TOKEN` | `vca_57Mt…` stored in CLI auth | Already configured locally |
| `GITHUB_TOKEN` | `ghp_wi7J…` in CCR trigger prompt | Already configured in trigger |

---

## 4. Morning Pipeline

### How it runs
The CCR trigger fires at 06:00 UTC, clones the repo, writes today's JSON, and pushes. Vercel picks up the push and auto-builds. ISR pages revalidate within 1 hour.

### What the trigger does (v5)
1. **WebSearch** — 9 queries, last 24h
2. **Build JSON** — applies paywall filter (§6), assembles Digest object
3. **git clone** → write JSON → **git push** to `main`
4. **Telegram** — sends top 3 headlines + link to your phone

### Running the pipeline manually
Go to https://claude.ai/code/scheduled/trig_01GbKbhfBPM3s5zTM2xvFNJH → Run Now.

Or from local repo (uses the full TypeScript pipeline with Unsplash + Gemini):
```bash
cp .env.example .env.local  # fill in keys
pnpm build-digest
git add content/digests/ public/images/heroes/
git commit -m "digest: $(date +%Y-%m-%d)"
git push origin main
```

### Local dev
```bash
pnpm install
cp .env.example .env.local   # optional — site works without keys
pnpm dev                     # http://localhost:3000
```

---

## 5. Imagery Strategy

**Current behaviour (no API keys needed):**
Stories use [Lorem Picsum](https://picsum.photos) deterministic photos as fallback — `https://picsum.photos/seed/{storyId}/800/534`. Each story always gets the same photo. No API key, no cost, real photos visible immediately.

**With `UNSPLASH_ACCESS_KEY`:**
The `scripts/build-digest.ts` pipeline calls Unsplash `/search/photos` using the first 4 headline words + topic as query. Caches the URL in `imageUrl` in the JSON. Once populated, `imageUrl` takes precedence over the Picsum fallback.

**With `GEMINI_API_KEY`:**
`scripts/build-digest.ts` calls Gemini 2.0 Flash image generation for the hero story only.  
Prompt: `"editorial magazine illustration in the style of Esquire or The Atlantic, subject: {hero.headline}, muted palette, painterly, no text, no logos, 16:9"`  
Output: `public/images/heroes/{date}.png` — committed to repo, served as static asset.  
Cost: 1 API call per day. Skips if file already exists (idempotent).

**Fallback priority (in order):**
1. `story.imageUrl` from JSON (Unsplash, populated by `pnpm build-digest`)
2. `public/images/heroes/{date}.png` (hero only, Gemini-generated)
3. Lorem Picsum deterministic URL (always active, no key needed)

---

## 6. Paywall Rule

### HARD PRODUCT REQUIREMENT — NOT A PREFERENCE

No story may link to paywalled, subscriber-only, or registration-gated content. This rule overrides all other considerations. If in doubt, exclude.

**Hard-excluded domains (blocked unconditionally):**
`economist.com` · `newyorker.com` · `ft.com` · `wsj.com` · `bloomberg.com` · `nytimes.com` · `washingtonpost.com` · `harpers.org` · `theinformation.com` · `stratechery.com`

**URL pattern detection — block if URL contains:**
`/subscriber` · `/subscribers-only` · `/paid` · `/members-only` · `/premium` · `/pro/` · `/plus/`

**RSS category detection — block if category/tag contains:**
`subscriber-only` · `members-only` · `paid-content` · `premium` · `paywall`

**HTML content detection — block if HTML contains:**
- `"isAccessibleForFree": false` in JSON-LD
- `Subscribe to continue`
- `This article is for subscribers`
- `Become a member`

Implementation: `lib/ingestion/paywall-detector.ts` — `checkUrl()`, `checkCategories()`, `checkHtml()`.

---

## 7. Routes

| Route | Description | Caching |
|---|---|---|
| `/` | Today's digest (latest JSON) | ISR 1h |
| `/[date]` | Specific day e.g. `/2026-04-20` | ISR 1h |
| `/topic/[slug]` | All stories for a topic, newest first, paginated 20/page | Dynamic |
| `/archive` | Calendar grid of all available days | Static |
| `/shelf` | Saved stories from localStorage | Client-only |
| `/api/stories` | Flat JSON of all stories across all digests | Dynamic |

---

## 8. Components

See `/components/README.md` for full documentation.

| Component | Purpose |
|---|---|
| `Masthead` | Wordmark header with date and issue number |
| `HeroStory` | Full-bleed lead story with drop cap |
| `StoryCard` | Image-top card used in topic grids |
| `TopicSection` | Section header + 2–3 column StoryCard grid |
| `SaveButton` | Bookmark toggle synced to Zustand shelf store |
| `DateNav` | Prev/next arrows + date picker |
| `TopicNav` | Horizontal topic pill navigation |
| `ShelfFilters` | Filter chips + JSON/Markdown export for `/shelf` |

---

## 9. Shelf

- Saved story IDs stored in `localStorage` key `iura-shelf` as `string[]`
- Zustand store in `lib/store.ts` — hydrates on client mount, never on server
- Story IDs that no longer exist in any JSON are silently skipped
- Export formats: JSON (full story objects) and Markdown (`## Headline`, dek, source link, saved date)

---

## 10. Telegram Integration

The bot reads the same `content/digests/{date}.json` — no schema change needed.

To include `in-the-world` topic in bot notifications:
1. Add `"in-the-world"` to the topic filter list
2. Map to label `"In the World"`
3. Stories are in the same `stories[]` array — filter by `story.topic === "in-the-world"`

Bot credentials: `~/.claude/channels/telegram/.env` (local server for interactive Claude ↔ Telegram). Daily notification is sent directly by the CCR trigger via Telegram Bot API — the local server is not involved.

---

## 11. Adding a New Topic

1. Add the slug to the `Topic` union in `lib/types.ts`
2. Add display label to `TOPIC_LABELS` in `lib/topic-labels.ts`
3. Add to `generateStaticParams` in `app/topic/[slug]/page.tsx`
4. **Required:** Any stories for this topic must pass all paywall checks (§6)

---

## 12. Adding a New Source

1. Verify the domain is not on the hard-excluded list
2. Manually check 5+ recent articles — confirm free access
3. Check for URL-pattern and HTML paywall markers
4. Add to `RSS_SOURCES` in `lib/ingestion/in-the-world.ts` with `name`, `url`, `domain`
5. Run `pnpm build-digest` and check console — confirm zero paywall drops from the new source
6. If 3 consecutive runs produce consistent paywall drops, remove the source and log the decision

---

## 13. Disabled Legacy Triggers

| ID | Name | Status |
|---|---|---|
| `trig_01WySTCNnkUiZANtuDB41s8u` | v1 — Gmail only | Disabled |
| `trig_012tZVLrSqFMf2vpdM3DMXka` | v2 — first Vercel attempt | Disabled |
| `trig_01LQ2bJWR2NFpXaxqp51k3Lt` | v3 — wrong topics | Disabled |
| `trig_01JzktDyWpXSYmQd3Tg9Kpd1` | v3b — project ID bug | Disabled |

These all used the old `vercel deploy` HTML approach. v5 uses git push + Next.js ISR.
