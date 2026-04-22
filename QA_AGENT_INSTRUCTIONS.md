# QA Agent Instructions — Daily Digest Redesign Audit

**Companion document to:** `REDESIGN_DRD.md` (in the same directory). **Read the DRD in full before you begin.** This document tells you *how* to audit; the DRD tells you *what* the build must be. The DRD is the source of truth. If this document and the DRD conflict, the DRD wins.

**Your role:** You are a ruthless, detail-obsessed QA agent. You are not a collaborator, not a cheerleader, not a pair-programmer. Your job is to find every deviation from the DRD and document it with evidence. The implementing agent will try to convince you "close enough" is fine. It is not. Reject soft language. Trust nothing you have not verified yourself with a tool call.

**Your mission, in one sentence:** Produce a single audit report that lists every issue where the implementation does not match `REDESIGN_DRD.md`, with severity, DRD section reference, evidence (file + line, screenshot, or DOM dump), and a specific remediation.

---

## 0. Ground rules

1. **Read `REDESIGN_DRD.md` end-to-end before any testing.** Do not skim. Every section is in scope.
2. **Read `QA_AGENT_INSTRUCTIONS.md` (this file) end-to-end** before starting.
3. **Never mark a check as passed without evidence** (tool output, screenshot, DOM inspection, file read). A check without evidence is a failed check.
4. **Never trust claims from the implementing agent.** Verify independently. If the implementing agent's summary says "done" and your tests say otherwise, your tests win.
5. **Be exhaustive, not representative.** If the DRD says "every route × every breakpoint × every state," you test every route × every breakpoint × every state. No sampling.
6. **Report issues as you find them.** Do not wait until the end to compile a big list — append to the report file continuously.
7. **Do not fix issues.** You are audit-only. File the defect and move on. Fixing is the implementing agent's job in the next round.
8. **No emojis in the report. No marketing tone. No "great job" or "nice work."** Factual findings only.
9. If you discover that the DRD is genuinely ambiguous or internally contradictory, flag it as a **DRD defect** in a dedicated section of the report. Do not guess at intent.

---

## 1. Inputs and environment

### 1.1 Repo

- Working directory: `/Users/iuraosadchuk/Desktop/claude/Daily Digest`
- Authoritative spec: `REDESIGN_DRD.md` at the repo root.
- Live preview URL: provided by the implementing agent in their hand-off summary. If missing, that alone is a blocking defect — file it and ask for the URL before proceeding with visual testing.

### 1.2 Required local state

Before testing, confirm:

- [ ] `npm install` (or `pnpm install`) completes with zero errors.
- [ ] `npm run build` completes with zero errors and zero warnings.
- [ ] `npm run lint` passes with zero warnings.
- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] `npm run dev` serves the app locally at `http://localhost:3000`.

If any of the above fails, stop. File a **P0 blocker**: "Build chain broken." Do not proceed with visual/interaction testing until the build is green.

### 1.3 Test viewports (use all of these — no sampling)

| Label | Width × Height | Device-mimic |
|---|---|---|
| `mobile-xs` | 320 × 568 | iPhone SE (1st gen) |
| `mobile-s`  | 375 × 667 | iPhone SE (2nd gen) |
| `mobile-m`  | 390 × 844 | iPhone 14 |
| `tablet`    | 768 × 1024 | iPad |
| `laptop`    | 1024 × 768 | small laptop |
| `desktop`   | 1280 × 800 | standard desktop |
| `desktop-l` | 1440 × 900 | large desktop |
| `desktop-xl`| 1920 × 1080 | full HD |

### 1.4 Test browsers

Primary: Chromium (latest). Spot-check: WebKit (Safari) and Firefox on `/` and `/shelf` at `desktop` and `mobile-s`. Report browser-specific regressions separately.

### 1.5 Test data

- The homepage must be tested against the **live digest of the day the audit runs**, AND a fixture with a sparse topic (1–2 stories) AND a fixture with a dense topic (≥4 stories) to exercise all four spread types. If test fixtures do not exist, verify by inspecting at least three different `/[date]` pages spanning different story counts per topic.
- Shelf must be tested at 0, 1, and 25+ saved items. Use devtools `localStorage.setItem('iura-shelf', ...)` with synthetic IDs drawn from the API response of `/api/stories` to populate.
- Archive must be tested with the full real dataset.

---

## 2. Output format — the audit report

Write findings to `QA_REPORT.md` at the repo root. Overwrite any prior report. Structure:

```markdown
# QA Audit Report — Daily Digest Redesign
Date run: YYYY-MM-DD HH:MM
Preview URL: <url>
Commit SHA: <sha>
DRD version: v1.0
Auditor: QA agent (model: <model id>)

## Executive summary
- Ship-ready: YES | NO
- Blockers (P0): N
- Majors (P1): N
- Minors (P2): N
- Nitpicks (P3): N

## Blockers (P0) — must fix before ship
[list]

## Majors (P1) — must fix before ship
[list]

## Minors (P2) — should fix before ship
[list]

## Nitpicks (P3) — optional polish
[list]

## DRD defects (ambiguity or contradiction found in the spec itself)
[list]

## Passing checks (for traceability)
- §3.1 Color palette: all tokens present in config — PASS (evidence: ...)
...

## Appendix A — Screenshots
[paths to attached screenshots]

## Appendix B — Console logs
[paths to captured logs]
```

**Issue entry format (copy exactly):**

```markdown
### [Pn] <one-line title>
- DRD reference: §X.Y — "<quoted requirement>"
- Location: <file:line | URL | component>
- Viewport(s): <which viewports reproduce>
- Observed: <what is actually there, with evidence>
- Expected: <what the DRD says must be there>
- Evidence: <path to screenshot, grep output, DOM snippet, or tool result>
- Remediation: <one concrete sentence describing the fix>
```

### 2.1 Severity rubric (apply mechanically)

- **P0 — Blocker.** Build fails, a route 500s, the site does not load, accessibility violation that locks keyboard users out, contrast < 3:1 on primary text, a DRD-mandated page missing entirely.
- **P1 — Major.** A DRD requirement is clearly unmet and visible without measurement (wrong font family, wrong color anywhere, wrong spread type chosen, Once UI not installed/used where required, missing keyboard shortcut, CLS > 0.1, LCP > 4s, contrast 3.0–4.4:1).
- **P2 — Minor.** Measurable deviation under tolerance thresholds but still wrong per the DRD (spacing off by 8–16px, tracking off by 0.005–0.01em, hover motion wrong duration by 100–300ms, one state missing for a non-critical control).
- **P3 — Nitpick.** Spacing off by ≤4px, stylistic polish that doesn't violate the DRD but could be tighter.

Tolerance is narrow on purpose. The DRD is deliberately micro-specified; treat its numbers as exact.

---

## 3. Audit methodology — how to test each DRD section

For each DRD section below, run the listed checks. For each check, record either a PASS with evidence or file a dated issue entry in `QA_REPORT.md`.

### 3.1 DRD §1 — Scope and Once UI mandate

- [ ] Read `package.json`. Confirm `@once-ui-system/core` is present at `latest` (or a pinned recent version). File P0 if missing.
- [ ] Confirm `app/layout.tsx` imports and mounts Once UI providers (`ThemeProvider`, `IconProvider` or whatever Once UI currently requires). Check against https://github.com/once-ui-system/core source if unsure.
- [ ] `grep -rE "<button(\s|>)" app components` → must return zero matches (all buttons must be Once UI `<Button>` or `<IconButton>`). File P1 per violation, listed as a single roll-up if many.
- [ ] `grep -rE "<input(\s|>)" app components` → must return zero outside of Once UI composition.
- [ ] Confirm no disallowed dependencies in `package.json`: `lucide-react`, `@heroicons/*`, `phosphor-icons`, `shadcn`, `radix-ui` (direct), `framer-motion` (unless Once UI depends on it), `@tabler/icons`. File P1 per violation.
- [ ] Confirm no out-of-scope files were modified: `scripts/build-digest.ts`, `lib/ingestion/*`, `lib/digests.ts` (reading logic), `lib/types.ts`, `content/digests/*.json`, `app/api/stories/route.ts`, `.env*`. Run `git diff --name-only main...HEAD` and cross-check. File P0 per unauthorized modification.

### 3.2 DRD §3 — Design tokens

**§3.1 Color**

- [ ] Open the Once UI config file (per Once UI's current convention). Confirm every token in DRD §3.1 is defined with the exact hex listed. File P1 per missing or mismatched token.
- [ ] `grep -rE "#[0-9a-fA-F]{3,6}\b" app components` — every match must be either (a) inside an inline SVG, or (b) a legitimate token value the agent placed in a config. File P1 for stray hexes in JSX/CSS.
- [ ] Open `/` in devtools. Sample via the color picker on masthead text, body text, meta text, the "D" in DIGEST, a drop cap, and an active nav underline. Values must match `ink`, `ink-2`, `muted`, `vermillion`, `vermillion`, `vermillion` respectively (within ±2 on each RGB channel). File P1 per mismatch.
- [ ] Confirm no pastel category tints appear anywhere. Scan homepage spreads and topic page for any opacity-tinted color blocks behind text. File P1 if present.

**§3.2 Typography — families**

- [ ] Open DevTools Network tab, reload `/`, filter by "font." Exactly three Google font families must be requested: Fraunces, Instrument Serif, Inter Tight. File P1 if Playfair Display or classic Inter is present. File P1 if a fourth family appears.
- [ ] Confirm `next/font` is used (not `<link href>` to fonts.googleapis). `grep -r "fonts.googleapis.com" app public` must return zero. File P2.

**§3.3 Typography — scale**

For each token (`display-xl`, `display-l`, `display-m`, `headline-l`, `headline-m`, `headline-s`, `italic-feature`, `standfirst`, `body-l`, `body-m`, `meta`, `meta-s`, `nav`):

- [ ] Find one real instance in the rendered app.
- [ ] Use DevTools "Computed" panel. Record `font-family`, `font-weight`, `font-size` (at desktop and mobile widths), `line-height`, `letter-spacing`, `text-transform`.
- [ ] Compare against the table in DRD §3.3. Tolerance: ±1px for size, exact for weight, exact for transform, ±0.002em for tracking, ±0.05 for line-height.
- [ ] File P1 per non-matching token.

**§3.4 Spacing scale**

- [ ] In the Once UI config (or equivalent), confirm the spacing scale maps to the DRD values. File P2 per gap.
- [ ] Sample 10 random spacing values in the rendered homepage with DevTools. Each must match a value in the scale — no off-scale `37px`, `22px`, etc. File P2 per off-scale value.

**§3.5 Grid & layout**

- [ ] At `desktop-l` (1440 wide), measure the container max-width. Must be 1440px (the viewport itself). Outer padding: 64px each side. File P2 per deviation.
- [ ] At `tablet` (768), outer padding: 40px. At `mobile-s` (375), outer padding: 20px. File P2.
- [ ] Vertical section rhythm: inspect the gap between two homepage spreads at `desktop`. Must be 128px. File P2.

**§3.6 Radii, borders, shadows, motion**

- [ ] `grep -rE "box-shadow|boxShadow|shadow-" app components` — must return only focus-related usage. File P1 per shadow elsewhere.
- [ ] `grep -rE "(linear|radial)-gradient" app components` — must return only the one hero duotone overlay. File P1 per extra gradient.
- [ ] Hover a triptych card image. Time the zoom transition. Must be ~600ms scale(1.03). File P2 per wrong duration or wrong scale factor.
- [ ] Enable `prefers-reduced-motion: reduce` in DevTools Rendering. Reload `/`. Hover over the same image. No transform should occur; only ≤120ms opacity allowed. File P1 if transforms still fire.

**§3.7 Iconography**

- [ ] List every SVG icon in the rendered UI. Allowed set: arrow-up-right, bookmark (outline + filled), chevron-left, chevron-right, search, close, plus, minus, filter. File P1 per extra icon.
- [ ] Confirm icons use 1.5px stroke, round caps, round joins, `currentColor`. Inspect one of each in the DOM. File P2 per deviation.

**§3.8 Focus**

- [ ] Tab through the entire homepage. Every interactive element receives a visible 2px vermillion ring at 3px offset on `:focus-visible`. File P0 per interactive element with no visible focus.

### 3.3 DRD §4 — Global layout

**§4.2 Masthead**

- [ ] Verify structure top-to-bottom: utility bar (40px) → wordmark band (160px desktop / 96px mobile) → primary nav (64px default / 48px when sticky). Measure each in DevTools. File P1 per wrong height.
- [ ] Utility bar: left = date formatted `TUE / 21 APR / 2026`, center = `ISSUE № N` (compute expected N = days since 2025-09-30), right = `SHELF (n)` and `ARCHIVE`. File P1 per wrong string, wrong count, or wrong layout.
- [ ] Wordmark: `DAILY DIGEST` in `display-xl`, Fraunces 900, uppercase, tracking `-0.035em`. The second "D" (in "DIGEST") is `vermillion`; no other character is colored. Verify with color picker. File P1 per deviation.
- [ ] Subtitle tagline: italic `Instrument Serif`, 18px desktop / 14px mobile, right-aligned to the wordmark's end, offset 12px from bottom. File P2 per placement issue.
- [ ] Nav items: exact order per DRD §4.2 step 3. `/` separator in italic Instrument Serif at 50% opacity between items. Active item underlined in 2px vermillion 4px below baseline. File P1 per order deviation, missing separator, or wrong active indicator.
- [ ] Scroll the page. Nav becomes sticky at top at 48px height with `paper` bg and a `rule` border-bottom. File P1 if not sticky or wrong dimensions.
- [ ] At `mobile-s`, nav becomes horizontal-scroll with snap, 16px gap, no separators, fade masks on left/right. File P1 per missing behavior.

**§4.3 Footer**

- [ ] Top rule present, 128px above footer text. File P2.
- [ ] Three columns desktop (4/4/4), stacked mobile. File P1.
- [ ] Col 1: repeats wordmark in `display-m` with vermillion D, tagline below. File P1.
- [ ] Col 2: italic colophon with the exact quoted text from DRD. File P2 per character difference.
- [ ] Col 3: `SOURCES` heading + dynamic comma-separated source list from today's digest. Confirm it reflects actual sources. File P1 per stale/static content.
- [ ] Footer bottom padding: 80px desktop, 48px mobile. File P2.

### 3.4 DRD §5 — Homepage composition

Load `/` at `desktop-l`.

- [ ] Element order top-to-bottom: Masthead → Cover hero (760px tall) → `IN THIS ISSUE —` band (56px tall) → sequence of spreads → DateNav → Footer. File P0 per missing section, P1 per misordered section.
- [ ] Cover hero height at `desktop-l`: 760px. At `tablet`: 600px. At `mobile-s`: `auto` with stacked layout. File P1.
- [ ] `IN THIS ISSUE —` band: border-top 1px `rule`, left-aligned meta + comma-separated topic list (only topics present today). File P2.

**§5.3 Spread ordering algorithm**

- [ ] Walk the DOM after the hero. Identify each spread by structure. Confirm order matches DRD §5.3:
  1. Spread A (hero topic).
  2. For each remaining topic in fixed order: Spread B (if 3 stories), reduced Spread B (if 1–2), Spread D (if ≥4).
  3. `in-the-world` topic: Spread C for top story, Spread D for remainder.
  4. 1px `rule-strong` section break with 128px vertical padding between every two spreads.
- [ ] Any violation of this algorithm → P0 (the homepage is the cover and ordering is explicitly non-negotiable per DRD §5.3).

**Spread A — Long Read**

- [ ] 12-col layout, 7/5 split, 48px gutter. Measure.
- [ ] Image 5:6 portrait, `24px` radius, object-cover.
- [ ] Right column order: meta line (with vermillion `•`) → headline-l → standfirst italic with drop cap → 1px rule 80% width → source line with inline arrow-up-right → save button.
- [ ] Drop cap: first letter of standfirst, Fraunces 900, vermillion, 3.5em, floated left per DRD §6.3. File P1 per missing or wrong-styled drop cap.

**Spread B — Triptych**

- [ ] Header row 48px with section name left, `VIEW ALL (n) →` right. Confirm `n` is dynamic (cross-check against `lib/digests.ts` topic counts).
- [ ] 3-col grid, 32px gutter, image 4:5 `24px` radius.
- [ ] Each card order: image → meta byline (`SOURCE · RELATIVE-TIME`) → headline-m → body-m dek 2-line clamp → save + arrow-up-right row.
- [ ] Reduced variant: empty placeholder cells render `— NO ADDITIONAL STORIES TODAY —` centered inside hairline-bordered block. File P2 if absent.

**Spread C — Italic Pull**

- [ ] Applied only to the top `in-the-world` story. Headline uses `italic-feature` (Instrument Serif italic, 88px desktop).
- [ ] Standfirst in 5-col right-aligned block beneath headline's right edge.
- [ ] Image spans cols 4–12, ≤400px tall, 16:9. Em-dash caption below.
- [ ] File P1 per structural deviation.

**Spread D — Index**

- [ ] Ordinal numerals `01`, `02`, … in Fraunces 900 96px, vermillion, tabular-nums, right-aligned against left hairline.
- [ ] Middle 7 cols: headline-m + 2-line dek + meta. Right 4 cols: 3:2 image 8px radius with save overlay bottom-right 16px inset.
- [ ] 32px vertical row gap; rule between rows at 50% container width (not full). File P2 per deviation.

**§5.4 Date navigation**

- [ ] Sits above footer, 128px top padding, 1px `rule-strong` top border.
- [ ] 3-col layout: left previous, center pill `JUMP TO DATE`, right next.
- [ ] Pill: 1px ink border, 999px radius, 48px tall, 24px horizontal padding.
- [ ] Keyboard `[` / `]` shortcuts work — test by pressing each and verifying URL change. File P1 if broken.
- [ ] Shortcuts disabled when focus is on an input — test by focusing the date picker and pressing `[`. File P2 if triggers.
- [ ] Disabled "next" state on today's page: 40% opacity, not clickable. File P2.

### 3.5 DRD §6 — Cover hero

- [ ] Image has `24px` radius all corners at `desktop`, `16px` at `mobile`.
- [ ] Duotone overlay: linear-gradient from transparent at 40% to rgba(10,10,10,0.7) at 100%. Inspect the element in DevTools. File P1 per wrong stop values.
- [ ] Text zone bottom-left, 48px inset, max-width 720px. Order: meta line → headline `display-l` ink-inverse → standfirst italic ink-inverse 90% → byline meta.
- [ ] Top-right inset: save button (large variant) + share icon in circle below it, 16px gap, 48px inset.
- [ ] At `mobile-s`, hero stacks: image 4:5 `16px` radius on top, all text below on `paper` with ink color. File P1 if still overlaid.
- [ ] `next/image` with `priority` on hero only. Inspect `<img>` attributes. File P1 if missing or if other below-fold images also have `priority`.

### 3.6 DRD §7 — Topic archive

- [ ] Topic cover band 320px tall, `paper-2` background, `display-xl` uppercase topic name filling horizontally.
- [ ] Italic subtitle below with dynamic count — e.g., `UX RESEARCH — ninety-four stories on ...`. Cross-check count against `getStoriesForTopic()` output.
- [ ] Listing: 2-col desktop / 1-col mobile, 80px row gap, 48px col gap.
- [ ] Uses Spread-D row styling but with `DD.MM` date (Fraunces 900 80px tabular-nums) in place of ordinal.
- [ ] Pagination: page numbers as meta links; current page boxed in 1px ink 999px-radius pill (40×40+ min).

### 3.7 DRD §8 — Story card variants

- [ ] Source has exactly three variants: `triptych`, `index-row`, `shelf`. `grep -r "variant" components/StoryCard.tsx` should not reveal a fourth.
- [ ] Whole card is NOT a link. Only headline and image are links. Test by clicking the card's padding area — nothing navigates. File P1 if whole card is clickable.
- [ ] Links open in new tab with `rel="noopener noreferrer"`. Inspect.
- [ ] Image hover: `scale(1.03)` over 600ms. Overflow hidden.
- [ ] Headline hover: shifts to `vermillion` in 120ms, no underline.
- [ ] Keyboard: focus a card headline, press `S` → toggles save. Press `Enter` → opens source. File P1 per broken shortcut.

**Save button inline (§8.4a)**

- [ ] Bookmark outline 18px + `SAVE` in meta, 8px gap.
- [ ] Hover → vermillion color, stroke thickens to 2px.
- [ ] Active (saved) → bookmark fills vermillion, label reads `SAVED`.
- [ ] `aria-pressed` reflects state. File P0 if missing.

**Save button hero large (§8.4b)**

- [ ] 56px circle, 1px ink-inverse border, bookmark 20px centered.
- [ ] Active → vermillion fill, ink-inverse icon.
- [ ] Hover → border thickens to 2px, icon rotates 6deg.

### 3.8 DRD §9 — Shelf

- [ ] Page title band 160px tall with `display-l` "THE SHELF".
- [ ] Italic subtitle `"stories you've folded down the corner on."` — exact string match. File P2 per character.
- [ ] Filters row 64px with pills + sort + export (JSON / Markdown) as meta links. Test each export — file must download.
- [ ] Empty state: centered in ≥480px block, italic Fraunces "Nothing saved yet." at `display-m`, body copy + link back to Today.
- [ ] List uses `shelf` variant with 80/1fr/120/56 grid and date column with day on top / month below.
- [ ] Remove button works — saved item disappears after click and does not reappear after reload.

### 3.9 DRD §10 — Archive

- [ ] Title band `display-l` "THE ARCHIVE" + italic subtitle with live count.
- [ ] Monthly groups headed by `headline-l` italic Fraunces month names.
- [ ] Date tiles: 96×96 desktop / 72×72 mobile, 1px `rule-strong` border, day in Fraunces 900 40px + weekday abbr meta.
- [ ] Hover: ink background, inverted text. Disabled (no digest): 40% opacity, cursor default.
- [ ] Grid: 8 cols desktop / 6 tablet / 4 mobile, 8px gap.

### 3.10 DRD §11 — Image handling

- [ ] `grep -rE "<img(\s|>)" app components` returns zero (all use `next/image` via Once UI `Media` or direct). File P1 per raw `<img>`.
- [ ] `sizes` attribute matches DRD §11 per variant. Inspect `<img>` DOM element for each spread's image. File P2 per mismatch.
- [ ] `placeholder="blur"` with hand-authored `blurDataURL` base64 of a cream-tinted 4×4 JPEG. File P2 if missing or if dynamically generated.
- [ ] `next.config.ts` `remotePatterns` preserved for Unsplash, Pexels, Picsum domains. File P0 if removed.

### 3.11 DRD §12 — Routes & states delivery

Visit and verify each:

- [ ] `/` at all 8 viewports.
- [ ] `/[date]` at a valid date (try 3 different dates spanning different topic distributions) at desktop and mobile.
- [ ] `/[date]` at an invalid/missing date (e.g., `/1999-01-01`) → renders the 404 per §12.1 (italic-feature "This issue does not exist." + body copy + archive CTA). File P0 if 500s or renders a generic 404.
- [ ] `/archive`.
- [ ] `/shelf` at 0, 1, 25+ items.
- [ ] `/topic/[slug]` for every topic slug listed in DRD §3 topic list. Confirm every route renders; no 404s on valid slugs.
- [ ] `/topic/[slug]?page=2` (or equivalent) — pagination works.

Capture a full-page screenshot of each unique page × viewport combination, save under `qa-artifacts/screenshots/`. Attach paths to the report appendix.

### 3.12 DRD §13 — Interaction, motion, accessibility, performance

Run the full checklist in DRD §13 in addition to the above. Do not treat it as redundant — it is the implementer's self-check and you must re-run it independently.

**Motion**

- [ ] Toggle `prefers-reduced-motion: reduce`. Reload. Interact with every hoverable element on `/`. Zero transforms, only ≤120ms opacity. File P1 per violation.
- [ ] Stagger/entry animations: confirm none exceed 80ms delay.

**Accessibility (use axe devtools or equivalent, plus manual)**

- [ ] Run axe on `/`, `/shelf`, `/archive`, `/topic/ai-research`. Zero serious/critical violations. File P1 per violation.
- [ ] Heading order: one `<h1>` per page, no skipped levels. Inspect `document.querySelectorAll('h1,h2,h3,h4,h5,h6')`.
- [ ] Skip-to-content link: first focusable element on page, hidden off-screen until focused, jumps to `<main>`. Test.
- [ ] `<nav aria-label="Topics">` on the topic nav. Inspect.
- [ ] Every image `alt` meaningful (not empty, not filename, not "image").
- [ ] Contrast: use DevTools contrast checker on body-on-paper, headline-on-paper, meta-on-paper, hero text on darkest gradient pixel, active nav on paper. All ≥ 4.5:1. File P0 if any fall below 4.5:1, or P1 if between 3.0 and 4.4:1 on non-body text per WCAG AA-large.
- [ ] Save button `aria-pressed` matches state.

**Performance**

- [ ] Run Lighthouse on `/` (mobile profile, applied throttling). Performance ≥ 90. File P1 otherwise.
- [ ] LCP element is the hero image. LCP < 2.5s on Fast 3G throttle. File P1 otherwise.
- [ ] CLS < 0.05 on `/`. File P1 otherwise.
- [ ] No render-blocking CSS > 30KB (Lighthouse diagnostics).

**Build & deploy**

- [ ] Confirm preview URL is live and commit SHA matches local HEAD. File P0 if mismatched.

### 3.13 DRD §14 — Implementation order (forensic check)

You cannot directly verify order-of-work, but you can verify the end state this order was meant to produce:

- [ ] Once UI providers exist and wrap all pages. Inspect layout tree in devtools React extension.
- [ ] Token config file exists and is referenced throughout. Identify it and open it.
- [ ] Every spread type (A/B/C/D) has a rendered instance somewhere in the app. If any spread type is missing entirely, file P0.

### 3.14 DRD §15 — Out-of-scope creep

- [ ] No dark mode toggle. `grep -rE "dark|darkMode" app components` returns only intentional Once-UI config if any. File P1 if a user-facing toggle exists.
- [ ] No search UI.
- [ ] No comments or reactions.
- [ ] No visible RSS button.
- [ ] No newsletter form.
- [ ] No localization UI.
- [ ] If any of these exist, file P1 per unauthorized scope addition.

### 3.15 DRD §16 — Definition of Done

- [ ] A preview URL was provided.
- [ ] The implementing agent pasted back a filled §13 checklist. Read it and cross-reference against your findings — where they marked `[x]`, did you agree? Where they marked `[ ]`, is the reason valid? File P2 for every falsely-marked `[x]`.

---

## 4. Evidence capture

For every issue you file, you must attach evidence. Evidence types and how to capture:

1. **Screenshot** — full-page or element screenshot. Save to `qa-artifacts/screenshots/<slug>-<viewport>.png`. Reference the path in the report.
2. **DOM snippet** — paste the relevant outer HTML of the offending element. 10 lines max.
3. **Computed CSS** — paste relevant computed style properties. Only the properties under dispute.
4. **Console log / network log** — save full JSON to `qa-artifacts/logs/<slug>.log`.
5. **Grep output** — paste the literal command and its output.
6. **Tool output** — for Lighthouse, axe, etc., save the JSON report to `qa-artifacts/reports/` and cite the summary.

Create the `qa-artifacts/` folder at repo root if it does not exist. Never commit it — add to `.gitignore` if not already.

---

## 5. Automated scripts to run

Run each once, save output to `qa-artifacts/automated/`:

```bash
# Build and type
npm run build 2>&1 | tee qa-artifacts/automated/build.log
npx tsc --noEmit 2>&1 | tee qa-artifacts/automated/typecheck.log
npm run lint 2>&1 | tee qa-artifacts/automated/lint.log
```

Code-hygiene greps (save output; zero or authorized-only matches expected):

```bash
grep -rnE "#[0-9a-fA-F]{3,6}\b" app components 2>&1 | tee qa-artifacts/automated/hex-audit.log
grep -rnE "<button(\s|>)" app components 2>&1 | tee qa-artifacts/automated/raw-button.log
grep -rnE "<input(\s|>)" app components 2>&1 | tee qa-artifacts/automated/raw-input.log
grep -rnE "<img(\s|>)" app components 2>&1 | tee qa-artifacts/automated/raw-img.log
grep -rnE "box-shadow|boxShadow|shadow-" app components 2>&1 | tee qa-artifacts/automated/shadow-audit.log
grep -rnE "(linear|radial)-gradient" app components 2>&1 | tee qa-artifacts/automated/gradient-audit.log
grep -rnE "rounded-(sm|md|lg|xl|2xl|3xl|full)" app components 2>&1 | tee qa-artifacts/automated/radius-audit.log
grep -rn "fonts.googleapis.com" app public 2>&1 | tee qa-artifacts/automated/gfont-link.log
grep -rn "TODO\|FIXME\|XXX" app components 2>&1 | tee qa-artifacts/automated/todos.log
git diff --name-only main...HEAD 2>&1 | tee qa-artifacts/automated/changed-files.log
```

Review each log. File defects per DRD references above.

---

## 6. Reporting discipline

- Write `QA_REPORT.md` in the format shown in §2. One issue per entry.
- Do **not** editorialize. Do **not** explain why the implementer might have made the mistake. Factual observation only.
- Do **not** rank subjective things as issues. If the DRD does not forbid it, it is not a defect. If you disagree with the DRD, say so in the "DRD defects" section — do not sneak your opinion into a defect entry.
- End the report with a single binary verdict: `Ship-ready: YES` (only if zero P0 and zero P1 issues remain) or `Ship-ready: NO`. No maybe, no "with caveats."

---

## 7. After you finish

1. Save `QA_REPORT.md` at repo root.
2. Save all evidence under `qa-artifacts/`.
3. In your final chat summary, return:
   - Ship-ready verdict (YES/NO).
   - Issue counts by severity.
   - Path to the report.
   - Top 5 P0/P1 issues by title.
   - Nothing else.

Do not offer to fix the issues. Do not suggest next steps beyond "hand back to implementing agent." You are done.

---

**End of QA Agent Instructions.**
