# Daily Digest — UI Redesign Development Requirements Document (DRD)

**Owner:** Iura Osadchuk
**Doc status:** v1.0 — authoritative. If this document contradicts the existing code, this document wins.
**Live site being redesigned:** https://iura-daily-digest.vercel.app/
**Repo root:** `/Users/iuraosadchuk/Desktop/claude/Daily Digest`
**Date:** 2026-04-22

---

## 0. How to read this document (for the implementing agent)

Read this whole file before touching code. Do not skim. You are not allowed to improvise visual decisions — every color, size, weight, spacing value, and interaction is specified. If a spec is missing, **stop and ask** — do not guess. If a spec is ambiguous, **stop and ask**. "Looks close enough" is a failure.

**Golden rules:**
1. Do not introduce components, libraries, colors, fonts, or weights that are not listed in this document.
2. Do not change the data model, API routes, ingestion scripts, or the JSON shape of digests. Only the UI layer changes.
3. Every page and state listed in §12 must ship. Partial delivery is a failure.
4. Run the full QA checklist in §13 before declaring done. Attach the checklist result to your summary.
5. This is an **editorial magazine redesign**, not a dashboard, not a blog, not a news aggregator UI. If it starts to look like The Guardian, The Economist, Medium, or a SaaS product, stop and reset.

**Reference aesthetic (in priority order):**
- **Zenith Magazine** — oversized condensed serif wordmark, vermillion accent, hairline rules, uppercase micro-metadata, full-bleed photography, chunky bold sans secondary headlines, slash-separated navigation.
- **Futuretypes** — cream card-on-dark composition, elegant italic serif logo, discreet tag pills with `#` prefix, small uppercase author line above headline.
- **Blog Spot** — massive italic serif display headlines, rounded full-bleed imagery, pill-shaped overlay labels, parenthetical counts in nav.

**Aesthetic anti-patterns (do not ship):**
- Card-heavy grids with uniform thumbnails (current state).
- Pastel category tags with opacity tints.
- Drop shadows on cards. No shadows anywhere except where explicitly specified.
- Gradients. Anywhere.
- Rounded rectangles larger than 8px radius except where specified (hero imagery and sidebar cards only).
- Emoji, icon packs with filled duotone icons, generic Heroicons outline look.
- Any use of the word "dashboard" in the product.

---

## 1. Project scope

**In scope — UI only:**
- Complete visual redesign of all routes: `/`, `/[date]`, `/archive`, `/shelf`, `/topic/[slug]`.
- Redesign of all components under `components/`.
- Replacement of `tailwind.config.ts` tokens and `app/globals.css`.
- New font loading (see §3).
- New iconography (see §3.7).
- Responsive behavior: 375 / 768 / 1024 / 1280 / 1440+ breakpoints — all specified.
- Keyboard, focus, and reduced-motion behavior.

**Out of scope — do not touch:**
- `scripts/build-digest.ts`
- `lib/ingestion/*`
- `lib/digests.ts` (reading), `lib/types.ts` (shape)
- `content/digests/*.json` (data)
- `app/api/stories/route.ts`
- `.env` variables
- Next.js config unless explicitly needed for font loading

**Required dependency — the UI foundation:**
- **Once UI** — https://once-ui.com/ — GitHub: https://github.com/once-ui-system/core — npm package `@once-ui-system/core@latest`. This is the component + token system the entire redesign must be built on. Install via `npm i @once-ui-system/core@latest` (or pnpm equivalent). Wire up its `ThemeProvider`, `IconProvider`, and any other required providers in `app/layout.tsx` per Once UI's Next.js setup docs before building any page. When in doubt about API surface, read the source on GitHub directly — the repo is the authoritative reference, not memory or training data.
- **Consult the Once UI docs and GitHub source first, every time.** Before hand-rolling any primitive (button, input, flex, grid, heading, text, badge, tag, skeleton, icon, toast, command palette, mega-menu), check whether Once UI already ships it. If it does, use it. Do not reimplement.
- Components Once UI provides that you MUST use instead of custom: `Flex`, `Grid`, `Column`, `Row`, `Heading`, `Text`, `Button`, `IconButton`, `Tag`, `Badge`, `Icon`, `Skeleton`, `Line`, `Logo`, `SmartLink`, `RevealFx`, `Fade`, `Background`, `Media` (images), `Dropdown`, `Input`, `Select`. If Once UI has it, it is the tool.
- Once UI's design tokens are configured in a single file (per Once UI's convention — typically `src/resources/once-ui.config.ts` or equivalent per their current docs). Map the tokens in §3 of this DRD into Once UI's token system rather than writing a parallel Tailwind config. If Once UI tokens cannot express a value from §3 exactly, extend Once UI through its documented theming API — do not fork or patch the library.

**Other dependencies allowed:**
- `next/font/google` (already available)
- Peer deps of Once UI (install as Once UI requires).
- None other. No additional animation libraries, no extra icon packs, no shadcn, no Radix directly. Icons come from Once UI's `Icon` component (register any custom icon via Once UI's `IconProvider`).

**Tailwind note:** Once UI is not Tailwind-based. If the current project uses Tailwind, you may either (a) keep Tailwind only for trivial layout utilities while Once UI handles all components and tokens, or (b) remove Tailwind entirely in favor of Once UI's styling system. Pick one and be consistent — do not mix Tailwind component classes with Once UI components on the same element. Decision must be stated up-front in the implementation summary.

---

## 2. Design language — one-line manifesto

> A contemporary print magazine that happens to render in a browser. Cream paper. Ink black. One vermillion. Generous air. Typography that behaves like a headline in a glossy, not a tooltip in a SaaS app.

---

## 3. Design tokens (authoritative)

All tokens below must be implemented in `tailwind.config.ts` under `theme.extend` and referenced by utility classes. Raw hex values in JSX are forbidden except inline SVG `fill`/`stroke`.

### 3.1 Color

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F2EEE6` | Primary page background. Warm cream. |
| `paper-2` | `#E8E2D6` | Secondary surface for sidebar cards, masthead band on certain pages. |
| `ink` | `#0A0A0A` | Primary text, rules, icons. Near-black, never pure `#000`. |
| `ink-2` | `#1F1D1A` | Body text when on cream. |
| `bone` | `#FBF9F5` | Lightest surface (modal overlays, tooltip bg). |
| `vermillion` | `#E8432B` | THE accent. Used on wordmark, drop caps, hover states, save-active, dot markers. |
| `vermillion-ink` | `#B62D18` | Vermillion pressed/active state only. |
| `muted` | `#6B665C` | Secondary text, captions, source attribution. |
| `rule` | `#0A0A0A` at 12% opacity = `rgba(10,10,10,0.12)` | Hairline dividers on cream. |
| `rule-strong` | `#0A0A0A` | 1px solid dividers when intentional. |
| `ink-inverse` | `#F2EEE6` | Text on dark sections. |
| `void` | `#111110` | Dark band/section background (see hero duotone zones). |

**No other colors. No pastel category tags. No rainbow per topic.** Topics are distinguished by typography and rank, not color.

### 3.2 Typography — font families

Load via `next/font/google` in `app/layout.tsx`. Preload only the three weights called out. Use `display: 'swap'`.

| Role | Family | Weights | Styles | CSS var |
|---|---|---|---|---|
| Display serif | **Fraunces** (variable) | 400, 700, 900 | normal + italic | `--font-serif` |
| Display italic feature | **Instrument Serif** | 400 | normal + italic | `--font-italic` |
| UI sans | **Inter Tight** | 400, 500, 700 | normal only | `--font-sans` |

Remove Playfair Display and Inter (classic) entirely from `globals.css` and `layout.tsx`. No fallback stacks other than the `next/font` generated ones.

**Fraunces axis settings (CSS):**
- Headlines h1/h2/h3: `font-variation-settings: "opsz" 144, "SOFT" 50, "WONK" 0;`
- Body serif (if used): `font-variation-settings: "opsz" 14, "SOFT" 100, "WONK" 0;`

### 3.3 Typography — scale (desktop, px)

All sizes use `clamp()` for fluid scaling. Values below are **desktop target** → **mobile floor**.

| Token | Desktop | Mobile | Weight | Family | Line-height | Tracking | Transform |
|---|---|---|---|---|---|---|---|
| `display-xl` | 144 | 64 | 900 | Fraunces | 0.88 | -0.035em | none |
| `display-l` | 96 | 48 | 800 | Fraunces | 0.92 | -0.03em | none |
| `display-m` | 72 | 40 | 700 | Fraunces | 0.95 | -0.025em | none |
| `headline-l` | 48 | 32 | 700 | Fraunces | 1.02 | -0.02em | none |
| `headline-m` | 32 | 24 | 600 | Fraunces | 1.08 | -0.015em | none |
| `headline-s` | 24 | 20 | 600 | Fraunces | 1.15 | -0.01em | none |
| `italic-feature` | 88 | 44 | 400 italic | Instrument Serif | 0.9 | -0.02em | none |
| `standfirst` | 22 | 18 | 400 italic | Fraunces | 1.45 | 0 | none |
| `body-l` | 18 | 16 | 400 | Inter Tight | 1.55 | 0 | none |
| `body-m` | 15 | 14 | 400 | Inter Tight | 1.6 | 0 | none |
| `meta` | 11 | 11 | 500 | Inter Tight | 1.2 | 0.18em | uppercase |
| `meta-s` | 10 | 10 | 500 | Inter Tight | 1.2 | 0.22em | uppercase |
| `nav` | 13 | 13 | 500 | Inter Tight | 1 | 0.04em | none |

Fluid formulas (use in Tailwind):
```
display-xl: clamp(64px, 10vw, 144px)
display-l:  clamp(48px, 7vw,  96px)
display-m:  clamp(40px, 5.5vw, 72px)
headline-l: clamp(32px, 3.5vw, 48px)
headline-m: clamp(24px, 2.5vw, 32px)
headline-s: clamp(20px, 1.8vw, 24px)
italic-feature: clamp(44px, 6vw, 88px)
```

### 3.4 Spacing scale

Base unit: 4px. Implement as Tailwind `spacing` extension.

`0, 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80, 24=96, 32=128, 40=160, 48=192, 64=256`

### 3.5 Grid & layout

- **Max container width:** `1440px`.
- **Columns:** 12 on ≥1024px, 6 on 768–1023px, 4 on <768px.
- **Gutter:** 24px (desktop), 16px (mobile).
- **Outer padding:** 64px desktop, 40px tablet, 20px mobile.
- **Vertical section rhythm:** 128px between major sections desktop, 80px tablet, 64px mobile.

Do not use `max-w-6xl`. Delete it.

### 3.6 Radii, borders, shadows, motion

- **Radii:** `0` (default), `2px` (inputs only), `999px` (pills), `24px` (hero imagery + sidebar "feature" cards only). No other radii.
- **Borders:** `1px solid ink` (strong), `1px solid rule` (hairline). No 2px borders.
- **Shadows:** None. Zero. If you type `box-shadow` anywhere, you are doing it wrong. Exception: focus rings (see §3.8).
- **Motion:**
  - Default duration: `240ms`, ease `cubic-bezier(0.2, 0.6, 0.1, 1)` — name this `--ease-editorial`.
  - Hover image zoom: `scale(1.03)` over 600ms ease-out.
  - No parallax. No scroll-linked transforms. No stagger delays > 80ms.
  - All motion MUST respect `prefers-reduced-motion: reduce` → disable transforms, keep opacity fades ≤ 120ms.

### 3.7 Iconography

- Author inline SVGs only. 1.5px stroke, round caps, round joins, 24×24 viewBox, `currentColor`.
- Icons allowed: **arrow-up-right** (external/open), **bookmark** (outlined + filled variant), **chevron-left**, **chevron-right**, **search**, **close (×)**, **plus**, **minus**, **filter (3 horizontal lines of descending width)**.
- No other icons. Do not install `lucide-react`, `heroicons`, `phosphor`, etc.

### 3.8 Focus

- Focus ring: `outline: 2px solid var(--vermillion); outline-offset: 3px; border-radius: inherit;` — applied via `:focus-visible` only.
- Never remove focus from interactive elements.

---

## 4. Global layout

### 4.1 Document chrome

- `<html>` gets `lang="en"` and the font CSS vars.
- `<body>` background: `paper`. Text: `ink`.
- No body border, no outer frame, no rounded app container.

### 4.2 Masthead (`components/Masthead.tsx`)

**Target look:** Zenith-style oversized wordmark band, full container width, cream background, ink type, vermillion "D" in "DIGEST" (single-character accent).

**Structure (top-to-bottom):**
1. **Upper utility bar** — height 40px. Horizontal layout, `justify-between`, vertical centered.
   - Left: today's date, formatted as `TUE / 21 APR / 2026` — `meta` token, letter-spacing per spec.
   - Center: the literal string `ISSUE № 203` — calculated as days since `2025-09-30` (first digest). `meta` token.
   - Right: `SHELF (n)` where `n` is saved story count, and `ARCHIVE` — both `meta` token, separated by a vertical hairline `1px × 12px` at `rule-strong` with 16px horizontal spacing either side.
   - Border-bottom: 1px `rule`.
2. **Wordmark band** — 160px tall desktop, 96px mobile, vertically centered content.
   - The word **"DAILY DIGEST"** set in `display-xl`, Fraunces 900, tracking `-0.035em`, uppercase.
   - The **"D"** of "DIGEST" (second D) is colored `vermillion`. Nothing else is colored.
   - Subtitle line directly under, offset right-aligned to end of wordmark, 12px above the bottom edge: the italic serif phrase *"curated intelligence for product designers building in the AI era"* — `Instrument Serif` italic, 18px desktop, 14px mobile, `ink` color, max-width 480px, text wraps naturally.
   - Border-bottom: 1px `rule-strong` (solid ink hairline spanning full container width).
3. **Primary nav** (`components/TopicNav.tsx`) — 64px tall, sticky to top on scroll (becomes 48px tall when stuck, with background `paper` and border-bottom `rule`).
   - Items left-aligned, separated by a subtle `/` glyph set in `Instrument Serif` italic at 50% opacity.
   - Items in `nav` token. No underline by default.
   - Order: `Today`, `Product & Design`, `UX Research`, `AI Tools`, `AI Research`, `IoT Hardware`, `AIoT`, `Smart Ag`, `Career Signals`, `In the World`.
   - Active item: ink text with a 2px vermillion underline at 4px below baseline.
   - Hover: text shifts to `vermillion`; `/` separator does not shift.
   - On ≤768px: nav becomes horizontal scroll with snap, 16px gap, no separators, fade masks on left/right edges (8px wide `linear-gradient` from `paper` to transparent).

### 4.3 Footer

- Top rule: 1px `rule-strong`, full container width, 128px above footer text.
- Layout: 3 columns desktop, stacks on mobile.
  - Col 1 (4/12): repeat the wordmark "DAILY DIGEST" in `display-m`, vermillion D; below, in `body-m`, the publication tagline.
  - Col 2 (4/12): colophon — italic `Instrument Serif` 18px paragraph: *"Set in Fraunces and Inter Tight. Published daily from Barcelona. ©2026 Iura Osadchuk."*
  - Col 3 (4/12): `meta` list — `SOURCES` heading, then comma-separated sources appearing in today's digest (pulled from `digest.stories`). Wraps naturally.
- Footer bottom padding: 80px desktop, 48px mobile.

---

## 5. Homepage (`app/page.tsx`)

The homepage is **the front cover**. It must read, above the fold, as a magazine cover, not as a list.

### 5.1 Above-the-fold composition (desktop ≥1280px)

Order of rendered blocks from top:

1. Masthead (§4.2)
2. **Cover hero** (see §6) — full-width, max container width, 760px tall desktop.
3. Thin band (56px tall) — inside the container: left-aligned `meta` text reading `IN THIS ISSUE —` followed by a single-line comma-separated list of the 5 topic names present today, each a link. Border-top: 1px `rule`.

### 5.2 Below the fold — editorial sections

The homepage is a sequence of **editorial spreads**, NOT a uniform grid of cards. There are exactly **four spread types**; sections must cycle through them in the order specified below, regardless of topic order.

**Spread A — "The Long Read" (1 story, asymmetric split):**
- 12-col split: 7 cols image (left), 5 cols text (right), with 48px gutter between.
- Image: 5:6 portrait aspect, `24px` radius, object-cover.
- Right column vertical rhythm (top → bottom, 24px gap between blocks unless stated):
  - `meta`: topic name, a bullet `•` in vermillion, date (e.g., `PRODUCT & DESIGN • 21 APR 2026`).
  - `headline-l` (Fraunces 700). Max 3 lines. Hyphens: manual.
  - `standfirst` (italic Fraunces 22/18). Max 4 lines. First letter is a **drop cap** (see §6.3).
  - 1px `rule` hairline, 80% width.
  - Source line: `body-m`, with an inline arrow-up-right icon 14px after the source name.
  - Save button (§8.4).

**Spread B — "The Triptych" (3 stories, equal):**
- Full-width header row above the triptych, 48px tall: `meta` on left reading section name (e.g., `UX RESEARCH`), `meta` on right as a link `VIEW ALL (n) →` where n is total stories in that topic across all digests.
- Thin rule below header: 1px `rule-strong`.
- 3 equal columns, 32px gutter.
- Each item:
  - Image 4:5 aspect, `24px` radius.
  - 16px gap.
  - `meta` one-line byline: `SOURCE · RELATIVE-TIME` (e.g., `WIRED · 4H AGO`).
  - 8px gap.
  - `headline-m` (Fraunces 600). Max 3 lines, clamp.
  - 12px gap.
  - `body-m` dek, max 2 lines, clamp.
  - 16px gap.
  - Save button left-aligned with a tiny arrow-up-right icon right-aligned (justify-between).

**Spread C — "The Italic Pull" (1 story, italic feature):**
- 100% width inside container. No image on desktop — instead, the headline itself becomes the visual.
- Headline uses `italic-feature` token (Instrument Serif italic, 88px desktop). Positioned left, hangs from a hairline top rule.
- Standfirst sits in a 5-col block right-aligned beneath the headline's right edge.
- Below, a cropped 16:9 image spans columns 4–12 (right 9 cols) at max 400px tall.
- `meta` caption beneath image, left-aligned, prefixed by em-dash: `— Photograph from Unsplash by …`.
- This spread type is for the **top-ranked "In the World" story** each day.

**Spread D — "The Index" (4–6 stories, text-first list):**
- Use this for any remaining topic sections and for topics with >3 stories in the feed.
- Layout: 2-col list. Each row:
  - Left gutter (1 col): a giant ordinal numeral `01`, `02`, … in Fraunces 900 at 96px desktop, `vermillion`, tabular-nums, right-aligned against a left hairline rule.
  - Middle (7 cols): `headline-m` headline, `body-m` dek below in 2 lines clamp, then `meta` source line.
  - Right (4 cols): a 3:2 image, 8px radius (smaller than hero radius — this is an editorial detail), with a small save button overlaid bottom-right at 16px inset.
- 32px vertical gap between rows; 1px `rule` hairline between rows at 50% container width (not full).

### 5.3 Ordering logic (explicit rules, no discretion)

Given today's digest:
1. Render Spread A for the hero story (`digest.heroStoryId`).
2. Determine an ordered list of topics present in today's stories, excluding the hero topic, in this fixed order: `product-design`, `ux-research`, `ai-tools`, `ai-research`, `iot-hardware`, `aiot`, `smart-agriculture`, `career-signals`, `in-the-world`.
3. For each topic in that order:
   - If topic == `in-the-world`: render **Spread C** with its top story, then **Spread D** with the remaining in-the-world stories (if >1 remaining).
   - Else if topic has 3 stories: render **Spread B**.
   - Else if topic has 1–2 stories: render a reduced **Spread B** (still 3-col grid but only fill available cells; empty cells render a hairline-bordered "placeholder" block containing the `meta` text `— NO ADDITIONAL STORIES TODAY —` centered).
   - Else (≥4 stories): render **Spread D**.
4. Insert a **section break** between every two spreads: a 1px `rule-strong` line, 128px vertical padding.
5. Do not wrap spreads inside additional containers. No cards, no backgrounds, no extra borders.

### 5.4 Date navigation (`components/DateNav.tsx`)

- Located at the very bottom of the homepage, **before** the global footer, separated from content by 128px top padding and a 1px `rule-strong` top border.
- Layout: 3-column grid.
  - Left: `← PREVIOUS ISSUE` in `meta`, below it the previous date in `headline-m` italic (Fraunces italic 600).
  - Center: a date-picker trigger styled as a pill with 1px ink border, 999px radius, 48px tall, 24px horizontal padding, text `JUMP TO DATE` in `meta` with a small chevron-down at 12px gap.
  - Right: `NEXT ISSUE →` mirroring left. If no next issue, render disabled state: text at 40% opacity, not clickable, cursor `default`.
- Keyboard: preserve existing `[` / `]` shortcuts. When focus is on input fields, shortcuts disabled.

---

## 6. Cover hero (`components/HeroStory.tsx`) — detailed

This component is re-specified from scratch. Delete the existing implementation.

### 6.1 Composition

Full-width (inside container), 760px tall on ≥1280, 600px on 768–1279, `auto` on <768 (stacks).

**Desktop grid:** 12 cols, no gutter inside hero.
- Image occupies columns 1–12, full height, `24px` radius on all corners, object-cover, object-position center.
- A **duotone overlay**: `linear-gradient(180deg, rgba(10,10,10,0) 40%, rgba(10,10,10,0.7) 100%)` to preserve bottom-text legibility. Apply only if text sits on the image (see variants).

**Text zone:** bottom-left, inset 48px from image bottom-left corner, max-width 720px.
- Tiny top-meta line: `ISSUE № 203 — TODAY'S COVER` in `meta-s`, `ink-inverse`.
- 16px gap.
- Headline in `display-l` (Fraunces 800), color `ink-inverse`, 3-line max.
- 24px gap.
- Standfirst in `standfirst` italic, `ink-inverse` at 90% opacity, max 3 lines, max-width 560px.
- 32px gap.
- Byline row: `meta` with source + relative time + an arrow-up-right icon inline.

**Top-right inset:** a vertical stack at 48px inset from image top-right corner.
- Save button in a larger variant (see §8.4b).
- Below it, 16px gap, share icon (arrow-up-right inside a 40px circle, 1px ink-inverse border).

### 6.2 Mobile composition (<768)

Stack: image on top at 4:5 aspect, `16px` radius, then below on `paper` background (NOT overlaid): all text in black `ink` using the same scale but mobile floor values.

### 6.3 Drop cap

- Only in hero standfirst and Spread A standfirst.
- First character: Fraunces 900, color `vermillion`, `font-size: 3.5em`, `line-height: 0.85`, `float: left`, `padding: 6px 10px 0 0`, `margin-top: 4px`.
- If `prefers-reduced-motion`, no behavior change — drop cap is static anyway.
- Implement via `::first-letter` CSS on the target paragraph's class, not via JS.

### 6.4 Image handling

- Use `next/image` with `priority` on the hero only. All below-the-fold images `loading="lazy"`.
- `sizes` attribute must be set correctly per spread (exact values in §11).

---

## 7. Topic archive (`app/topic/[slug]/page.tsx`)

### 7.1 Header block

- Masthead (§4.2) as normal.
- Under the nav, a **topic cover band** at 320px tall (desktop), cream background `paper-2`.
- Inside: the topic name in `display-xl` Fraunces 900, uppercase, fills the band horizontally. The word wraps only if it would overflow.
- A single-line italic `Instrument Serif` subtitle below the display name, 24px gap, e.g., `UX RESEARCH — ninety-four stories on how people actually use things`. Count is dynamic.

### 7.2 Listing

- Grid: 2 cols desktop, 1 col mobile. 80px row gap, 48px column gap.
- Each item uses **Spread D row** styling (no ordinals here, replace ordinal column with the item's `publishedAt` formatted as `DD.MM` in Fraunces 900 80px, `ink`, tabular-nums, right-aligned against hairline).
- Pagination at the bottom: page numbers as `meta` links with current page boxed by a 1px ink border pill (999px radius, 40px min-width, 40px tall). Prev/next as text links `← NEWER` / `OLDER →`.

---

## 8. Story card (`components/StoryCard.tsx`)

There are **three card variants** — `triptych`, `index-row`, `shelf`. Variant is set via a `variant` prop. No other variants. No "default" card.

### 8.1 Variant `triptych`

See Spread B spec in §5.2.

### 8.2 Variant `index-row`

See Spread D spec in §5.2.

### 8.3 Variant `shelf`

- Horizontal row, full container width.
- Grid cols: 80px (date column) / 1fr (content) / 120px (image) / 56px (remove button).
- Date column: day and month stacked, Fraunces 700 36px day on top, `meta` month below.
- Content: `headline-m` headline, one-line dek clamp, `meta` source.
- Image: 4:3, 8px radius.
- Remove button: icon-only (close ×), 40px square, 1px rule border, icon size 16px.
- Row divided by 1px `rule` hairline at top.

### 8.4 Save button

**8.4a — Inline (default in cards):**
- Icon-text combo.
- Icon: bookmark outline 18px.
- Text: `SAVE` in `meta`.
- Gap between icon and text: 8px.
- Default: `ink` color.
- Hover: `vermillion` color, icon stroke thickens to 2px (visual weight, not size change).
- Active (saved): bookmark fills with `vermillion`, text reads `SAVED`, both `vermillion`.

**8.4b — Hero large variant:**
- Circular, 56px diameter, `ink-inverse` 1px border, transparent background, bookmark icon 20px centered.
- Active: background fills `vermillion`, border `vermillion`, icon `ink-inverse`.
- Hover: border thickens to 2px and rotates icon 6 degrees (via transform).

### 8.5 Card interactions

- Whole card is NOT a link. Only the headline and image are clickable links to the source URL, `target="_blank" rel="noopener noreferrer"`.
- Hover on image: `scale(1.03)` over 600ms. Overflow hidden on image container.
- Hover on headline: color shifts to `vermillion` over 120ms. No underline.
- Keyboard: preserve existing `Enter = open` and `S = save` shortcuts.
- Focus ring applies to headline and image independently.

---

## 9. Shelf (`app/shelf/page.tsx`)

- Masthead + nav as normal.
- Page title band (160px tall): `display-l` "THE SHELF", vermillion ampersand if ever used. Subtitle italic: *"stories you've folded down the corner on."*
- Filters row (`components/ShelfFilters.tsx`) — horizontal: filter pills for topic, sort dropdown, export actions (JSON / Markdown) as `meta` text links. Height 64px, bottom border 1px `rule`.
- Empty state: centered vertically in 480px min-height zone. Large italic Fraunces "Nothing saved yet." at `display-m`, below it body copy and a link back to Today.
- List uses `shelf` card variant (§8.3).

---

## 10. Archive (`app/archive/page.tsx`)

- Masthead + nav.
- Title band: `display-l` "THE ARCHIVE". Italic subtitle with count: *"203 issues and counting."*
- Monthly groups: month name as `headline-l` Fraunces italic (e.g., *April 2026*), then a grid of date tiles.
- Date tile: 96×96px square on desktop, 72×72 mobile. 1px `rule-strong` border. Content centered: day number in Fraunces 900 at 40px, weekday abbreviation in `meta` below. Hover: background fills `ink`, text inverts. Disabled (no digest): 40% opacity, cursor default.
- Tile grid: 8 cols desktop, 6 tablet, 4 mobile. 8px gap.

---

## 11. Image handling (global)

- Use `next/image` everywhere. Never `<img>` tags.
- Configure `next.config.ts` remotePatterns for existing Unsplash, Pexels, Picsum domains. Do not remove.
- Per-variant `sizes`:
  - Hero: `sizes="100vw"`, `priority`
  - Spread A: `sizes="(min-width: 1024px) 58vw, 100vw"`
  - Triptych: `sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"`
  - Index row: `sizes="(min-width: 1024px) 33vw, 90vw"`
  - Shelf: `sizes="120px"`
- Placeholder: use `placeholder="blur"` with a generated `blurDataURL` of a 4×4 cream-tinted noise pattern (hand-author a single base64 JPEG and import; do NOT generate dynamically).
- Fallback behavior (`lib/fallback.ts`) stays as-is — no changes.

---

## 12. Pages & states — explicit delivery checklist

Every item below must be visually implemented and verified.

**Routes:**
- [ ] `/` (today) — desktop, tablet, mobile
- [ ] `/[date]` for a valid date — desktop, tablet, mobile
- [ ] `/[date]` for an invalid/missing date — custom 404 matching magazine style (see §12.1)
- [ ] `/archive` — desktop, tablet, mobile
- [ ] `/shelf` with 0 saved items — desktop, mobile
- [ ] `/shelf` with 1 saved item — desktop
- [ ] `/shelf` with 25+ saved items — desktop
- [ ] `/topic/[slug]` for every topic, page 1 — desktop
- [ ] `/topic/[slug]` page 2+ (pagination) — desktop

**Component states:**
- [ ] Default, hover, focus-visible, active/pressed, disabled for every interactive element
- [ ] Save button: unsaved, hover-unsaved, focus, saved, hover-saved
- [ ] Nav item: default, hover, active, focus
- [ ] Empty topic section placeholder
- [ ] Loading state: no spinners. Use skeleton blocks with hairline 1px borders, no shimmer.

### 12.1 404 / missing-date page

- Masthead + nav.
- Body: a full-container spread with the `italic-feature` text set to `"This issue does not exist."` left-aligned.
- Below, `body-l` copy: "The archive begins on 30 September 2025. Try the archive index."
- CTA: text link `→ VIEW THE ARCHIVE` in `meta`.

---

## 13. QA checklist — the implementing agent MUST run this and return results

Do not declare the task complete without pasting this checklist into your final message with each box marked `[x]` (done) or `[ ]` with a reason.

### 13.1 Visual regression (manual, against this DRD)

- [ ] Every color used in the final build exists in §3.1. No stray hexes. Verify via `grep -rE "#[0-9a-fA-F]{3,6}" app components` — only tailwind-config hexes or SVG-internal hexes allowed.
- [ ] Exactly three Google fonts loaded: Fraunces, Instrument Serif, Inter Tight. Verify via `grep -r "next/font" app`.
- [ ] No `box-shadow` except focus ring. `grep -rE "boxShadow|box-shadow|shadow-" app components tailwind.config.ts` returns only focus-related or utility removals.
- [ ] No gradients except the hero duotone overlay. `grep -r "gradient" app components` returns only the specified overlay.
- [ ] Radii audit: only `0`, `2px`, `8px`, `24px`, `9999px` present. No `rounded-md`, `rounded-lg`, `rounded-xl` unless mapped to the above.
- [ ] Drop cap renders in hero standfirst and Spread A standfirst, vermillion, Fraunces 900.
- [ ] Vermillion accent used on: masthead "D", active nav underline, drop cap, save-active, Spread D ordinals, vermillion bullet in meta lines. Nowhere else.

### 13.2 Typography

- [ ] Display headlines fluid-scale without overflow at 320px, 375px, 768px, 1024px, 1280px, 1440px, 1920px viewport widths.
- [ ] No orphaned single words on final line of any headline in default test content (use CSS `text-wrap: balance` on all headlines).
- [ ] Body copy line length between 45 and 75 characters per line on desktop.
- [ ] `meta` text uppercase, tracked 0.18em, consistent.
- [ ] Italic standfirsts render in italic. Verify Fraunces italic file loaded (network tab).

### 13.3 Responsive

- [ ] At 320px width, no horizontal scroll anywhere.
- [ ] At 375px width, hero headline does not exceed 5 lines.
- [ ] At 768px, triptychs become 2-col, then 1-col below 640px.
- [ ] At 1440px, outer padding is exactly 64px.
- [ ] Nav at mobile scrolls horizontally with fade masks; no cut-off items.

### 13.4 Interaction & motion

- [ ] Every button, link, and input has a visible `:focus-visible` ring (2px vermillion, 3px offset).
- [ ] Tabbing through the homepage reaches items in reading order (masthead utility → nav → hero save → hero headline → in-this-issue items → each spread's headline → save → date-nav → footer).
- [ ] Save click toggles state instantly, persists via Zustand to localStorage, reflects on reload.
- [ ] Keyboard shortcuts: `[`/`]` for date nav, `S` for save (when card focused), `Enter` to open card link.
- [ ] `prefers-reduced-motion: reduce` disables all transforms and leaves only ≤120ms opacity fades. Verify via devtools emulation.

### 13.5 Accessibility

- [ ] All images have meaningful `alt`. Stock photos use source-derived alts; if none, alt = headline.
- [ ] Contrast: body on paper, headlines on paper, meta on paper — all ≥ 4.5:1. Hero text on gradient overlay ≥ 4.5:1 (verify with a contrast checker on the darkest part of the overlay).
- [ ] Meta text is not the sole way to convey meaning (don't rely on uppercase tiny text for primary actions).
- [ ] Heading order is correct: one `<h1>` per page (the wordmark or page title), subsequent headings descend logically.
- [ ] Skip-to-content link present at top of `<body>`, visually hidden until focused, jumps to `<main>`.
- [ ] Topic nav uses `<nav aria-label="Topics">`.
- [ ] Save button has `aria-pressed` reflecting saved state.

### 13.6 Performance

- [ ] Lighthouse mobile performance ≥ 90 on `/`.
- [ ] LCP element is the hero image; `priority` set; measured LCP < 2.5s on throttled Fast 3G test.
- [ ] Fonts loaded with `display: swap`; no layout shift from font swap (CLS < 0.05 on homepage).
- [ ] No render-blocking CSS > 30KB.
- [ ] No unused tokens in `tailwind.config.ts`.

### 13.7 Code hygiene

- [ ] **Once UI audit:** every button, input, tag, badge, flex/grid/column/row wrapper, icon, skeleton, and link in the final build is a Once UI component. `grep -rE "<button|<input" app components` returns zero results (except inside Once UI-internal code). Custom wrappers are fine only when they compose Once UI primitives.
- [ ] Once UI tokens (colors, spacing, radii, typography) are sourced from the Once UI config file, not hardcoded. No raw `#hex` except inside hand-authored SVGs.
- [ ] No raw hex values in JSX or CSS outside the Once UI token config and inline SVGs.
- [ ] No inline `style={}` unless setting CSS vars dynamically (allowed for count-based widths, etc.).
- [ ] No dead imports. Verify `pnpm lint` / `npm run lint` passes with zero warnings.
- [ ] TypeScript: zero errors. Verify `pnpm typecheck` or `tsc --noEmit`.
- [ ] No `// TODO` comments introduced.
- [ ] Removed files: old `globals.css` rules that referenced Playfair Display; old font imports in `layout.tsx`; any `rounded-lg`/`rounded-md` tokens not redefined.

### 13.8 Build & deploy

- [ ] `pnpm build` (or `npm run build`) succeeds with zero warnings.
- [ ] Preview deploy on Vercel succeeds. Paste the preview URL in the final summary.
- [ ] Verify live preview renders correctly at 375/768/1280 by opening in browser. Screenshot each viewport and attach to summary.

---

## 14. Implementation order (non-negotiable sequence)

Doing these in any other order is a failure mode — it creates rework.

0. **Install and configure Once UI first.** `npm i @once-ui-system/core@latest`, add providers to `app/layout.tsx`, verify a stock `<Button>` renders before touching anything else.
1. **Tokens.** Map §3 palette, type scale, radii, spacing into Once UI's config file. Wire `next/font` (Fraunces, Instrument Serif, Inter Tight) and expose them to Once UI's typography tokens. Smoke test: a scratch page rendering Once UI `<Heading>` at each size token, `<Text>` at each body token, and a color swatch row — all matching §3 values pixel-for-pixel.
2. **Masthead + Footer + Nav.** Global chrome in place before any page work.
3. **Hero.** Get the cover image and overlay + drop cap working on `/` before any spread work.
4. **Spread A** (long read).
5. **Spread B** (triptych).
6. **Spread C** (italic pull).
7. **Spread D** (index with ordinals).
8. **Homepage ordering logic** from §5.3.
9. **Date page** (reuses homepage composition with a different data fetch).
10. **Topic page.**
11. **Shelf.**
12. **Archive.**
13. **404 / missing date.**
14. **Responsive pass** across all breakpoints.
15. **Motion + reduced-motion pass.**
16. **Accessibility pass.**
17. **Performance pass.**
18. **Full QA (§13).**

---

## 15. Out-of-scope clarifications (stop asking)

- No dark mode.
- No search.
- No comments, reactions, or social.
- No RSS button visible in UI (even though ingestion uses RSS).
- No newsletter sign-up.
- No analytics UI (Vercel Analytics script can stay in `layout.tsx` if already present).
- No localization.
- No print stylesheet.

---

## 16. Definition of Done

The redesign is done when, and only when:

1. Every item in §12 is shipped.
2. Every item in §13 is checked off or explicitly annotated with a blocking reason.
3. A Vercel preview URL is live and matches this document.
4. The implementing agent has pasted a filled-out §13 checklist back to Iura.
5. Iura has reviewed the preview and confirmed "ship it."

If any of 1–4 is not true, the work is not done. Do not ask Iura to "take a look at what I have so far" in place of finishing. Finish first; then ask.

---

**End of DRD.**
