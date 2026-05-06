# Daily Digest — Handoff Document

**Last updated:** May 6, 2026  
**Owner:** Iura Osadchuk  
**Live site:** https://iura-daily-digest.vercel.app

---

## 1. Automation Architecture

The system is fully automated and runs entirely in the cloud via GitHub Actions.

```
[GitHub Actions — 06:00 UTC / 08:00 Madrid]
    │
    ├─ pnpm build-digest (scripts/build-digest.ts)
    │    ├─ Filter previously seen URLs (content/seen-urls.json)
    │    ├─ Fetch news (RSS feeds + The Guardian API)
    │    ├─ Fetch cover images (Unsplash/Pexels)
    │    └─ Extract content (lib/extract.ts → content/extracted/*.json)
    │
    ├─ Write digest JSON → content/digests/YYYY-MM-DD.json
    │
    ├─ git commit + git push origin main
    │       └─ Vercel auto-build triggered
    │
    └─ Telegram notification → @iurasclaude_bot
```

**Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS · Zustand · GitHub Actions · Vercel  
**Deduplication:** Persistent 30-day rolling log in `content/seen-urls.json`. Articles are never repeated within a month.

---

## 2. Shelf & Cross-Device Sync

The "Shelf" allows saving articles across devices and browser sessions.

- **Instant State:** Uses `localStorage` as a zero-latency local cache.
- **Cloud Sync:** Syncs to a private **GitHub Gist** in the background via a server-side proxy route (`/api/shelf`).
- **Stable Identity:** Articles are identified by their `sourceUrl`. This ensures bookmarks remain valid even if the daily digest is rebuilt or stories are reordered.
- **Hydration:** The app automatically merges local and remote saves on every page load.

---

## 3. In-Site Reader Experience

Articles are now read directly on the site via the reader view at `/article/[id]`.

- **Build-Time Extraction:** Content is extracted during the daily build using `@mozilla/readability`.
- **Persistence:** Extracted JSON is stored in `content/extracted/` and committed to the repo, ensuring archived articles remain readable forever.
- **Runtime Fallback:** If a pre-extracted file is missing, the site falls back to a runtime extractor (`/api/extract`).
- **Shelf Integration:** The reader page includes a full-featured Save button that syncs with the user's Shelf.
- **Styling:** Custom `prose-dd` CSS classes provide a clean, distraction-free reading experience matched to the Daily Digest design system.

---

## 3. Infrastructure & Credentials

All secrets are managed as **GitHub Actions Secrets**.

| Resource | Value / Location |
|---|---|
| GitHub Repository | https://github.com/iurche/iura-daily-digest |
| GitHub Actions | /actions (Runs every day at 06:00 UTC) |
| Vercel Project | `iura-daily-digest` |
| Telegram Bot | `@iurasclaude_bot` (Chat ID: `382160671`) |
| Storage (Shelf) | Private GitHub Gist |

### Required Secrets (GitHub)
- `VERCEL_TOKEN`: For deployment status/CLI access.
- `TELEGRAM_BOT_TOKEN`: For automated daily notifications.
- `GH_PAT`: Personal Access Token for the bot to push new digests to the repo.
- `SHELF_GIST_ID` & `SHELF_GITHUB_TOKEN`: For cross-device shelf storage.
- `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, `GEMINI_API_KEY`, `GUARDIAN_API_KEY`: Content APIs.

---

## 4. Topics & Content

The digest covers 8-10 core topics including Product Design, UX Research, AI Innovation, IoT, and Career Signals.

**Key Features:**
- **Hero Story:** The lead article of the day with high-impact visuals.
- **Topic Filtering:** Dedicated views for every discipline.
- **Archive:** Full calendar-based navigation of historical digests.
- **Same-day Safety:** Manual re-runs of the pipeline (via GitHub Actions "Run workflow") are safe and will refresh content without blocking same-day stories unless they were featured in previous days.

---

## 5. Development & Deployment

### Local Development
```bash
pnpm install
pnpm dev
```

### Manual Trigger
If you need to force an update immediately:
1. Go to **GitHub Actions** → **Daily Digest**.
2. Click **Run workflow** → **Branch: main**.

---

## 6. Known Items
1. **Stable IDs**: Articles saved before April 27, 2026, should be re-saved to use the new `sourceUrl` identification format.
2. **First Load Sync**: Cloud sync happens in the background. After saving on a new device, allow 1-2 seconds for the state to merge on other devices.
3. **Legacy Triggers**: All old Claude Cloud (CCR) triggers have been decommissioned in favor of GitHub Actions.
