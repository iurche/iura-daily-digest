# Daily Digest — Handoff Document
**Date:** April 20, 2026  
**Owner:** Iura Osadchuk

---

## What Was Built

A fully automated daily briefing system that:
1. Searches the web across 8 curated topics every morning
2. Builds a fresh HTML digest page and deploys it to Vercel
3. Sends a Telegram message with the top 3 headlines + link

---

## Live URLs

| Resource | URL |
|---|---|
| Digest website | https://iura-daily-digest.vercel.app |
| Manage triggers | https://claude.ai/code/scheduled |
| Active trigger | https://claude.ai/code/scheduled/trig_01GbKbhfBPM3s5zTM2xvFNJH |
| Vercel project | https://vercel.com/iurches-projects/iura-daily-digest |

---

## Schedule

**Every day at 8:00 AM Madrid time (6:00 AM UTC)**  
Cron: `0 6 * * *`

---

## Topics Covered (8 sections)

| # | Topic | Purpose |
|---|---|---|
| 1 | Product management & design | Core discipline |
| 2 | UX tools & research methods | Core discipline |
| 3 | AI tools & product launches | Tool awareness |
| 4 | AI innovation & applied research | Strategic horizon |
| 5 | IoT — hardware, sensors, devices | Adjacent domain |
| 6 | AIoT — AI + IoT convergence | Key opportunity space |
| 7 | IoT/AI for energy, sustainability, smart agriculture | Sector-specific |
| 8 | Senior designer/director roles — EU, Spain, Barcelona | Career intelligence |

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

## Credentials Reference

> These are stored in the remote trigger prompt. If you need to rotate them, update the trigger at the manage URL above.

| Credential | Location |
|---|---|
| Vercel API token | Trigger prompt (Step 3) |
| Telegram bot token | Trigger prompt (Step 4) + `~/.claude/channels/telegram/.env` |

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
        ├─ Write index.html + .vercel/project.json to /tmp/digest
        │
        ├─ npx vercel deploy --prod → iura-daily-digest.vercel.app
        │
        └─ curl → Telegram Bot API → @iurasclaude_bot → your phone
```

---

## Dependencies

| Tool | Status |
|---|---|
| bun runtime | Installed at `~/.bun/bin/bun` |
| Telegram plugin | `telegram@claude-plugins-official` v0.0.6 |
| Vercel MCP connector | Connected at claude.ai/settings/connectors |
| Gmail MCP connector | Connected (not used by digest, available for other automations) |
