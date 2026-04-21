# Iura's Daily Digest

An editorial magazine-style daily briefing — visual language of The Atlantic, warm serif typography, no dashboard aesthetics.

---

## Local Development

```bash
pnpm install
cp .env.example .env.local
# Fill in keys in .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Setup

Copy `.env.example` to `.env.local` and populate:

| Key | Source |
|---|---|
| `UNSPLASH_ACCESS_KEY` | [unsplash.com/developers](https://unsplash.com/developers) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) |
| `GUARDIAN_API_KEY` | [open-platform.theguardian.com](https://open-platform.theguardian.com/access/) |

---

## Content

Digest JSON files live at `content/digests/YYYY-MM-DD.json`. Each file is a complete `Digest` object with all stories for that day. See `lib/types.ts` for the schema.

The seed digest is `content/digests/2026-04-20.json`.

---

## Morning Pipeline

Generate today's digest (In the World ingestion + Unsplash images + Gemini hero):

```bash
pnpm build-digest
```

Then commit and push:

```bash
git add content/digests/ public/images/heroes/
git commit -m "digest: $(date +%Y-%m-%d)"
git push origin main
```

Vercel auto-builds. ISR picks up within 1 hour.

---

## Adding a New Topic

1. Add slug to `Topic` union in `lib/types.ts`
2. Add display label to `TOPIC_LABELS` in `lib/topic-labels.ts`
3. Add to `VALID_TOPICS` in `app/topic/[slug]/page.tsx`
4. Create fallback SVGs at `public/images/fallback/{slug}/0.svg` through `7.svg`
5. Add stories with the new topic slug to digest JSONs

---

## Adding a New Source

1. Verify the domain is not on the hard-excluded paywall list (see `lib/ingestion/paywall-detector.ts`)
2. Manually confirm articles are freely accessible
3. Add to `RSS_SOURCES` in `lib/ingestion/in-the-world.ts`
4. Run `pnpm build-digest` and check console for paywall drops
5. **Note:** PAYWALL CHECK IS A HARD PRODUCT REQUIREMENT — never add a source that blocks free access

---

## Deployment

Push to `main` → Vercel auto-deploys. No manual steps needed.

For first deploy, connect the repo to a Vercel project and set env vars in the Vercel dashboard.
