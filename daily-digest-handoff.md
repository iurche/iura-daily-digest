# Daily Digest — Handoff Document
**Date:** April 22, 2026  
**Owner:** Iura Osadchuk

---

## What Was Built

A fully automated daily briefing system that:
1. Searches the web across 8 curated topics every morning
2. Builds a fresh digest and deploys it to Vercel
3. Sends a Telegram message with the top 3 headlines + link

**April 2026 Major Rebuild:** The site was completely rebuilt as a Next.js 15 application with:
- Real images from Unsplash + Pexels APIs
- Topic pages (e.g., /topic/ai-innovation)
- Archive page with calendar navigation
- Shelf for saved stories (localStorage)
- Minimalist newspaper-style UI

---

## Live URLs

| Resource | URL |
|---|---|
| Digest website | https://iura-daily-digest.vercel.app |
| Archive | https://iura-daily-digest.vercel.app/archive |
| Shelf | https://iura-daily-digest.vercel.app/shelf |
| Manage triggers | https://claude.ai/code/scheduled |
| Active trigger | https://claude.ai/code/scheduled/trig_01GbKbhfBPM3s5zTM2xvFNJH |
| Vercel project | https://vercel.com/iurches-projects/iura-daily-digest |
| GitHub repo | https://github.com/iurche/iura-daily-digest |

---

## Schedule

**Every day at 8:00 AM Madrid time (6:00 AM UTC)**  
Cron: `0 6 * * *`

---

## Topics Covered (8 sections)

| # | Topic | Purpose | URL |
|---|---|---|---|
| 1 | Product management & design | Core discipline | /topic/product-management |
| 2 | UX tools & research methods | Core discipline | /topic/ux-tools |
| 3 | AI tools & product launches | Tool awareness | /topic/ai-tools |
| 4 | AI innovation & applied research | Strategic horizon | /topic/ai-innovation |
| 5 | IoT — hardware, sensors, devices | Adjacent domain | /topic/iot |
| 6 | AIoT — AI + IoT convergence | Key opportunity space | /topic/aiot |
| 7 | IoT/AI for energy, sustainability, smart agriculture | Sector-specific | /topic/sustainability |
| 8 | Senior designer/director roles — EU, Spain, Barcelona | Career intelligence | /topic/career |

### Callout types on the website
- **CAREER SIGNAL** — highlights job market signals
- **RELEVANT TO YOUR PROJECTS** — flags anything relevant to Tuza or AI-IoT work

---

## Telegram Bot

| Field | Value |
|---|---|
| Bot username | @iurasclaude_bot |
| Chat ID | 382160671 |
| Access policy | `allowlist` (locked — only your ID can trigger) |
| Config file | `~/.claude/channels/telegram/access.json` |
| Bot token file | `~/.claude/channels/telegram/.env` |

### Keep the bot server running
The bot server must be running locally for Claude Code to receive Telegram messages. It starts via a Python wrapper:

```bash
cd ~/.claude/plugins/cache/claude-plugins-official/telegram/0.0.6
python3 -c "
import subprocess, os
proc = subprocess.Popen(
    [os.path.expanduser('~/.bun/bin/bun'), 'server.ts'],
    stdin=subprocess.PIPE,
    stdout=open('/tmp/telegram-bot.log', 'w'),
    stderr=subprocess.STDOUT,
    cwd=os.path.expanduser('~/.claude/plugins/cache/claude-plugins-official/telegram/0.0.6')
)
proc.wait()
" &
```

Check if running: `ps aux | grep "bun server.ts" | grep -v grep`  
Check logs: `cat /tmp/telegram-bot.log`

> Note: The daily digest Telegram notification is sent directly by the remote agent via the Telegram Bot API — this local server is only needed for interactive Claude Code ↔ Telegram messaging.

---

## Vercel Configuration

| Field | Value |
|---|---|
| Project name | `iura-daily-digest` |
| Project ID | `prj_8qAe7bjzbNCE4JeAxctZ4XERGV7q` |
| Team ID | `team_hFg1AbJcnmTpl80fMp9B67g1` |
| Token name | `claude-digest` (create at vercel.com/account/tokens) |

The remote agent deploys by writing a `.vercel/project.json` with the project ID hardcoded — this prevents Vercel CLI from creating a new project on each run.

---

## Environment Variables (Vercel)

Required in Vercel project settings:

| Variable | Purpose |
|---|---|
| `UNSPLASH_ACCESS_KEY` | For fetching cover images |
| `PEXELS_API_KEY` | Backup image source |
| `GEMINI_API_KEY` | For generating AI image captions |

---

## Credentials Reference

> These are stored in the remote trigger prompt. If you need to rotate them, update the trigger at the manage URL above.

| Credential | Location |
|---|---|
| Vercel API token | Trigger prompt (Step 3) |
| Telegram bot token | Trigger prompt (Step 4) + `~/.claude/channels/telegram/.env` |
| Unsplash key | Vercel env vars |
| Pexels key | Vercel env vars |
| Gemini key | Vercel env vars |

---

## How to Modify Topics

1. Go to https://claude.ai/code/scheduled
2. Open trigger `trig_01GbKbhfBPM3s5zTM2xvFNJH`
3. Edit the prompt — Step 1 lists the 8 WebSearch queries
4. Or tell Claude Code: *"update the digest topics to include X"*

---

## How to Re-run Manually

In Claude Code:
```
Run the daily digest trigger now
```
Or directly via the scheduled page → Run Now.

---

## Site Features

### Homepage
- Hero story (first story with large image)
- 8 topic sections with 3-5 stories each
- Date navigation (previous/next day)
- "Save to shelf" button on each story

### Topic Pages
- Filtered view of all stories for a specific topic
- `/topic/ai-innovation`, `/topic/product-management`, etc.

### Archive
- Calendar-style month navigation
- Browse digests by date
- Shows all historical digests

### Shelf
- Saved stories stored in localStorage
- Persists across sessions
- Keyboard shortcut: press 's' on any story to save/unsave

---

## Build & Deploy

### Local development
```bash
cd daily-digest
pnpm install
pnpm dev
```

### Deploy to Vercel
```bash
cd daily-digest
git add -A
git commit -m "Update digest"
git push
```

Vercel auto-deploys on push to main.

---

## Disabled Triggers (safe to ignore)

These earlier versions were disabled during iteration:

| ID | Name |
|---|---|
| `trig_01WySTCNnkUiZANtuDB41s8u` | v1 — Gmail only |
| `trig_012tZVLrSqFMf2vpdM3DMXka` | v2 — first Vercel attempt |
| `trig_01LQ2bJWR2NFpXaxqp51k3Lt` | v3 — wrong topics |
| `trig_01JzktDyWpXSYmQd3Tg9Kpd1` | v3b — project ID bug |

---

## Architecture

```
[Remote Agent — CCR Cloud]
        │
        ├─ WebSearch × 8 topics (last 24h)
        │
        ├─ Generate story data with Gemini
        │
        ├─ Fetch images from Unsplash/Pexels
        │
        ├─ Write digest JSON → content/digests/
        │
        ├─ Git push → Vercel auto-deploy
        │
        └─ curl → Telegram Bot API → @iurasclaude_bot → your phone

[Local Dev]
        │
        ├─ Next.js 15 app (App Router)
        ├─ Static pages generated from JSON
        ├─ Client-side: Shelf (localStorage), SaveButton
        └─ Images: Unsplash + Pexels APIs
```

---

## Dependencies

| Tool | Status |
|---|---|
| bun runtime | Installed at `~/.bun/bin/bun` |
| pnpm | Package manager |
| Next.js 15 | Framework |
| Telegram plugin | `telegram@claude-plugins-official` v0.0.6 |
| Vercel MCP connector | Connected at claude.ai/settings/connectors |
| Gmail MCP connector | Connected (not used by digest, available for other automations) |

---

## Known Issues

1. **Image caching**: External images may show fallback SVGs on first load due to browser caching. Hard refresh (Cmd+Shift+R) clears it.
2. **Shelf sync**: Shelf data is localStorage-only — not synced across devices.

---

## File Structure

```
daily-digest/
├── app/
│   ├── layout.tsx          # Root layout + nav
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Tailwind + custom styles
│   ├── [date]/page.tsx    # Date-specific digest
│   ├── archive/page.tsx   # Archive/calendar
│   ├── shelf/page.tsx     # Saved stories
│   └── topic/[slug]/page.tsx  # Topic-filtered view
├── components/
│   ├── Masthead.tsx       # Site title + date
│   ├── TopicNav.tsx       # Topic navigation
│   ├── TopicSection.tsx   # Section with stories
│   ├── StoryCard.tsx      # Individual story card
│   ├── HeroStory.tsx      # Featured story
│   ├── DateNav.tsx        # Previous/next day
│   ├── SaveButton.tsx     # Shelf toggle
│   └── ShelfFilters.tsx   # Filter UI
├── content/digests/       # JSON data (generated)
│   └── 2026-04-21.json
├── lib/
│   ├── digests.ts         # Load/parse digests
│   ├── types.ts           # TypeScript types
│   ├── topic-labels.ts    # Topic display names
│   ├── store.ts           # Shelf state (Zustand)
│   └── fallback.ts        # Fallback SVG URLs
├── scripts/
│   └── build-digest.ts    # Digest generation script
├── tailwind.config.ts     # Tailwind config
└── next.config.ts         # Next.js config
```
