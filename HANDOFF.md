# Daily Digest — Complete Handoff Document

---

## 1. JSON Schema

### `Digest` type
```ts
{
  date: string;          // YYYY-MM-DD — date of the issue
  heroStoryId: string;   // ID of the lead story (must match a story in stories[])
  stories: Story[];      // All stories for this issue, all topics
}
```

### `Story` type
```ts
{
  id: string;            // Format: "{date}-{topic}-{index}" e.g. "2026-04-20-ai-tools-2"
  topic: Topic;          // One of the valid Topic enum values (see below)
  headline: string;      // Story title — max ~120 chars
  dek: string;           // 1–3 sentence summary — editorial voice, no jargon
  source: string;        // Display name of the source publication
  sourceUrl: string;     // Direct URL to the article (must be accessible, not paywalled)
  imageUrl?: string;     // Optional image URL (Unsplash or local /images/heroes/ path)
  imageCredit?: string;  // Optional credit string e.g. "Photo by Name on Unsplash"
  isHero?: boolean;      // If true, this is the hero story for the issue
  publishedAt: string;   // ISO 8601 datetime e.g. "2026-04-20T08:00:00.000Z"
}
```

### Valid `Topic` values
- `product-design`
- `ux-research`
- `ai-tools`
- `ai-research`
- `iot-hardware`
- `aiot`
- `smart-agriculture`
- `career-signals`
- `in-the-world`

---

## 2. Required Environment Variables

| Variable | Purpose | Where to get it |
|---|---|---|
| `UNSPLASH_ACCESS_KEY` | Fetch article images from Unsplash API | [unsplash.com/developers](https://unsplash.com/developers) |
| `GEMINI_API_KEY` | Generate hero editorial illustration via Gemini 2.0 Flash | [aistudio.google.com](https://aistudio.google.com) |
| `GUARDIAN_API_KEY` | Fetch "In the World" stories from The Guardian Open Platform | [open-platform.theguardian.com](https://open-platform.theguardian.com/access/) |
| `VERCEL_TOKEN` | Deploy via Vercel CLI / GitHub Actions | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `GITHUB_TOKEN` | Push digest JSON to repo from CI pipeline | GitHub → Settings → Developer Settings → PATs |

Set these in `.env.local` for local dev. Set in Vercel project settings for production.

---

## 3. Morning Pipeline — Step by Step

Run: `pnpm build-digest`

1. **In the World ingestion** — fetches Guardian API (4 sections) + 7 RSS feeds, filters last 24h items, runs paywall checks on every URL and RSS category, deduplicates by headline, scores by dek quality, selects top 6 stories.
2. **Load existing digest** — if `content/digests/{TODAY}.json` exists, loads it to preserve manually-curated stories for non-in-the-world topics.
3. **Assemble stories** — merges curated stories + fresh in-the-world stories.
4. **Unsplash images** — for each story without an `imageUrl`, calls Unsplash `/search/photos` with `{first 4 headline words} {topic}` and caches URL + credit. Rate-limited to ~200ms between calls.
5. **Hero image** — calls Gemini 2.0 Flash image generation with editorial magazine prompt. Saves to `public/images/heroes/{date}.png`. Skips if file already exists (idempotent).
6. **Writes JSON** — final `Digest` object written to `content/digests/{YYYY-MM-DD}.json`.
7. **Prints stats** — total stories, hero, paywall drops, image counts.

---

## 4. GitHub Flow

After the JSON is written and hero image saved:

```bash
git add content/digests/ public/images/heroes/
git commit -m "digest: $(date +%Y-%m-%d)"
git push origin main
```

Vercel auto-deploys on every push to `main`. ISR pages with `revalidate = 3600` will pick up new content within 1 hour of deploy. To force immediate revalidation, trigger a redeploy from the Vercel dashboard.

**Recommended:** wrap the above in a shell script or GitHub Action triggered at 06:00 UTC daily.

---

## 5. Image Generation

- **Hero image:** Gemini 2.0 Flash (`gemini-2.0-flash-preview-image-generation`) generates a 16:9 editorial illustration for the lead story.
- **Prompt pattern:** `"editorial magazine illustration in the style of Esquire or The Atlantic, subject: {hero.headline}, muted palette, painterly, no text, no logos, 16:9"`
- **Storage:** `public/images/heroes/{date}.png` — committed to repo, served as static asset.
- **Idempotency:** If the file exists, generation is skipped — safe to re-run the pipeline.
- **Cost:** 1 Gemini API call per day. At current pricing, negligible.
- **Fallback:** If Gemini call fails or no API key, the hero uses a topic-colored SVG placeholder from `public/images/fallback/`.

---

## 6. Paywall Rule

### HARD PRODUCT REQUIREMENT — NOT A PREFERENCE

No story included in the digest may link to paywalled content. This applies to all sources at all times. Violation degrades user trust irreparably.

**Hard-excluded domains (blocked unconditionally):**
- `economist.com`
- `newyorker.com`
- `ft.com`
- `wsj.com`
- `bloomberg.com`
- `nytimes.com`
- `washingtonpost.com`
- `harpers.org`
- `theinformation.com`
- `stratechery.com`

**URL pattern detection (block if matched):**
- `/subscriber` in path
- `/subscribers-only` in path
- `/paid` in path
- `/members-only` in path
- `/premium` in path
- `/pro/` in path
- `/plus/` in path

**RSS category detection (block if matched):**
- `subscriber-only`
- `members-only`
- `paid-content`
- `premium`
- `paywall`

**HTML content detection (block if matched):**
- JSON-LD contains `"isAccessibleForFree": false` or `"isAccessibleForFree":"false"`
- HTML contains `"Subscribe to continue"`
- HTML contains `"This article is for subscribers"`
- HTML contains `"Become a member"`

All checks are enforced in `lib/ingestion/paywall-detector.ts`. Any new source or story must pass all applicable checks before inclusion.

---

## 7. Telegram Bot Integration

The Telegram bot reads the same `content/digests/{date}.json` schema. No schema change is needed.

To add `in-the-world` topic support in the Telegram bot:
1. Add `"in-the-world"` to the bot's topic filter list.
2. Map to display label `"In the World"`.
3. Stories are in the same `stories[]` array as all other topics — filter by `story.topic === "in-the-world"`.

No pipeline change required — `in-the-world` stories are already included in every JSON written by `build-digest.ts`.

---

## 8. Adding a New Topic

1. Add the new topic slug to the `Topic` union type in `lib/types.ts`.
2. Add a display label to `TOPIC_LABELS` in `lib/topic-labels.ts`.
3. Add the valid slug to the `VALID_TOPICS` array in `app/topic/[slug]/page.tsx`.
4. Create fallback SVGs at `public/images/fallback/{new-topic}/0.svg` through `7.svg`.
5. If the topic has dedicated RSS sources, add them to `RSS_SOURCES` in `lib/ingestion/in-the-world.ts` (or create a new ingestion module).
6. **Required:** Run paywall check on any new sources before adding.

## 9. Adding a New Source

1. Verify the source domain is NOT on the hard-excluded list.
2. Check several recent articles manually to confirm they are freely accessible.
3. Check for URL-pattern, category, and HTML paywall markers.
4. Add to `RSS_SOURCES` in `lib/ingestion/in-the-world.ts` with `name`, `url`, and `domain`.
5. Test by running `pnpm build-digest` and checking console logs for any paywall drops from the new source.
6. If source has consistent paywall issues after 3 runs, remove it permanently and log the decision.
