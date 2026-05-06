# Daily Digest — Handoff Document

**Last updated:** May 6, 2026 (Phase 3: Simplenote Integration Finalized)  
**Owner:** Iura Osadchuk  
**Live site:** https://iura-daily-digest.vercel.app

---

## 1. Automation Architecture

The system has two complementary runners:

### GitHub Actions (Daily Build)
```
[GitHub Actions — 06:00 UTC daily]
    │
    ├─ pnpm build-digest (scripts/build-digest.ts)
    │    ├─ Filter previously seen URLs (content/seen-urls.json)
    │    ├─ Fetch news (RSS feeds + The Guardian API)
    │    ├─ Fetch cover images (Unsplash/Pexels)
    │    └─ Extract content (@mozilla/readability → content/extracted/*.json)
    │
    ├─ Write digest JSON → content/digests/YYYY-MM-DD.json
    │
    ├─ git commit as iuriiosad@gmail.com + git push origin main
    │       └─ Vercel auto-build triggered
    │
    └─ No Telegram notification from this runner
```

### Claude Scheduled Task (Telegram Notification)
```
[Claude Scheduled Task — 08:12 AM Madrid time daily]
    │
    ├─ Runs same build-digest pipeline
    ├─ git commit as iuriiosad@gmail.com
    └─ Sends Telegram notification with top 3 headlines
```

**Why two runners?** The scheduled task ensures Telegram notifications fire reliably. GitHub Actions handles the core digest build.

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS · Zustand · GitHub Actions · Vercel  
**Deduplication:** Persistent 30-day rolling log in `content/seen-urls.json`. Articles are never repeated within a month.
**Git Identity:** Both runners now use `iuriiosad@gmail.com` to ensure Vercel accepts all deployments.

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

## 4. Contextual Gemini Chat

Every article has a contextual chat assistant aware of both the article content and the user's professional profile.

- **Profile Config:** `lib/profile.ts` contains Iura's role, goals, and interests.
- **Model:** Uses `gemini-2.0-flash-001` (primary) and `gemini-1.5-flash` (fallback).
- **Context Management:** 
    - Full extracted article text is injected into the system prompt (truncated to 30k chars).
    - **Sliding Window:** Sends only the most recent 30 messages to Gemini to maintain context without hitting limits.
- **Persistence:** Chat threads are synced to the same GitHub Gist as the Shelf, stored in `chats.json`.
- **UI:** A floating sparkle button opens a slide-in drawer (desktop) or bottom sheet (mobile). Supports streaming responses and starter prompts.

---

## 5. Infrastructure & Credentials

### GitHub Secrets (for GitHub Actions)
- `VERCEL_TOKEN`: For deployment status/CLI access.
- `TELEGRAM_BOT_TOKEN`: For automated daily notifications.
- `SHELF_GIST_ID` & `SHELF_GITHUB_TOKEN`: For cross-device shelf + chat storage (same Gist).
- `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, `GEMINI_API_KEY`, `GUARDIAN_API_KEY`: Content APIs.

### Vercel Environment Variables
- `GEMINI_API_KEY`: Set in Vercel project settings.
- `SIMPLENOTE_EMAIL`: your Simplenote email (for saving AI insights)
- `SIMPLENOTE_PASSWORD`: your Simplenote password

### Claude Scheduled Task
- Stored at `~/.claude/scheduled-tasks/daily-digest-pipeline/SKILL.md`
- Uses same Telegram token and API keys as GitHub Actions
- Enabled and auto-runs at 08:12 AM Madrid time daily

| Resource | Value / Location |
|---|---|
| GitHub Repository | https://github.com/iurche/iura-daily-digest |
| GitHub Actions | /actions (Runs every day at 06:00 UTC) |
| Vercel Project | `iura-daily-digest` |
| Telegram Bot | `@iurasclaude_bot` (Chat ID: `382160671`) |
| Storage (Shelf & Chat) | Private GitHub Gist |

---

## 6. Simplenote Integration (Verified)

Every Gemini chat response can be saved directly to your Simplenote account for career development.

### How It Works
- **Save Button:** Each AI response in the chat has a "📝 Simplenote" button.
- **Authentication:** Migrated to **Simperium v2 API** (App ID: `chalk-bump-f49`). Verified working on May 6, 2026.
- **Auto-Tagging:** Generates 5-7 smart tags (domain-focused: healthtech, agtech, etc.) prioritizing career relevance.
- **Note Format:** Rich formatting with professional context, article link, and action items.
- **Error Handling:** If save fails, the formatted note is automatically copied to the clipboard as a fallback.

---

## 7. Development & Deployment

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

## 8. Recent Changes (May 6, 2026)

- [x] **Simplenote Migration**: Moved from defunct legacy API to Simperium v2. Added production credentials.
- [x] **UI Cleanup**: Removed redundant "Save Insight" button from chat messages.
- [x] **Gemini Stabilization**: Fixed model identifiers and added robust fail-through fallback logic.
- [x] **Vercel Auth Fix**: Aligned git identity to `iuriiosad@gmail.com` to bypass Vercel author validation blocks.
