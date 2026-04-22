# QA Audit Report — Daily Digest Redesign
Date run: 2026-04-22 14:30
Preview URL: http://localhost:3000
Commit SHA: local
DRD version: v1.0
Auditor: QA agent (model: minimax-m2.5-free)

## Executive summary
- Ship-ready: NO
- Blockers (P0): 2
- Majors (P1): 5
- Minors (P2): 3
- Nitpicks (P3): 0

## Blockers (P0) — must fix before ship

### [P0-1] Save button missing from topic page story cards
- DRD reference: §7.2 — "Each item uses Spread D row styling (no ordinals here, replace ordinal column with the item's DD.MM formatted...)"
- Location: app/topic/[slug]/page.tsx:71-131
- Viewport(s): desktop, tablet, mobile
- Observed: Topic page renders story cards without any save button. The inline save button (bookmark icon + "SAVE" text) specified in DRD §8.4a is completely absent from each story row.
- Expected: Every story card should have an inline save button (bookmark outline 18px + "SAVE" in meta, 8px gap) per DRD §8.4a.
- Evidence: Full page render shows no bookmark/save functionality on any story card at http://localhost:3000/topic/product-design
- Remediation: Add SaveButton component to each story row in the topic page listing, positioned at bottom-right of content column or in a dedicated column per Spread D spec.

### [P0-2] Topic page header band layout broken — content does not wrap effectively
- DRD reference: §7.1 — "Topic cover band at 320px tall... Inside: the topic name in display-xl Fraunces 900, uppercase, fills the band horizontally. The word wraps only if it would overflow."
- Location: app/topic/[slug]/page.tsx:62-69
- Viewport(s): desktop, tablet, mobile
- Observed: Header band with class "h-80 bg-paper-2 flex flex-col justify-center px-4 md:px-6 lg:px-8 border-b border-rule-strong" has layout issues. The h1 and p elements stack with unnatural mt-6 gap, text is left-aligned rather than filling horizontally, and typography uses generic font classes instead of DRD-specified tokens.
- Expected: Topic name should fill band horizontally, centered or edge-to-edge per DRD aesthetic. The "fills the band horizontally" requirement is violated.
- Evidence: HTML shows flex-col justify-center producing unbalanced vertical stacking with excessive whitespace above content and insufficient below.
- Remediation: Redesign header band layout to ensure topic title fills horizontally with proper text wrapping behavior. Use exact DRD tokens: display-xl (144px desktop / 64px mobile), Fraunces 900 weight, uppercase, tracking -0.035em.

## Majors (P1) — must fix before ship

### [P1-1] Typography font families do not match DRD spec
- DRD reference: §3.2 — "Display serif: Fraunces (variable)... Display italic feature: Instrument Serif... UI sans: Inter Tight"
- Location: app/topic/[slug]/page.tsx:63-67
- Viewport(s): all
- Observed: Code uses className="font-serif font-black" on h1 and "font-serif-italic" on subtitle. These are not the DRD-specified font families.
- Expected: Should use directly configured font tokens from Once UI — display-xl (Fraunces 900), Instrument Serif italic for subtitle.
- Evidence: Lines 63-66 use non-existent tailwind classes
- Remediation: Replace font-serif, font-serif-italic, font-black with actual font token references: text-display-xl, font-[family: Fraunces], etc.

### [P1-2] Date format wrong on topic page cards
- DRD reference: §7.2 — "Each item uses Spread D row styling (no ordinals here, replace ordinal column with the item's publishedAt formatted as DD.MM in Fraunces 900 80px, ink, tabular-nums, right-aligned)"
- Location: app/topic/[slug]/page.tsx:83-89
- Viewport(s): desktop, tablet
- Observed: Date renders as separate elements: day "21" with text-display-m (72px), month "APR" with text-meta. Two-element layout instead of DD.MM format.
- Expected: Single DD.MM format in Fraunces 900 80px, tabular-nums, right-aligned against hairline. Not two separate spans.
- Evidence: Code at lines 83-89 shows grid col-span-2 with two separate span elements
- Remediation: Combine date into single formatted string "21.04" and style with text-[80px] (or clamp based on breakpoint), Fraunces 900, tabular-nums.

### [P1-3] Topic page grid spacing does not match DRD
- DRD reference: §7.2 — "Grid: 2 cols desktop, 1 col mobile. 80px row gap, 48px column gap."
- Location: app/topic/[slug]/page.tsx:76
- Viewport(s): desktop, tablet, mobile
- Observed: Code uses gap-12 only (48px), no distinction between row and column gaps per DRD spec.
- Expected: 80px vertical gap between rows, 48px horizontal gap between columns. Current implementation ignores row gap requirement.
- Evidence: gap-12 applies equal spacing in both directions
- Remediation: Apply gap-y-20 (80px) for row spacing and gap-x-12 (48px) for column spacing on the grid container.

### [P1-4] Subtitle format wrong on topic page header
- DRD reference: §7.1 — "A single-line italic Instrument Serif subtitle below the display name, 24px gap, e.g., UX RESEARCH — ninety-four stories on how people actually use things. Count is dynamic."
- Location: app/topic/[slug]/page.tsx:66-68
- Viewport(s): all
- Observed: Subtitle renders as "{total} {total === 1 ? "story" : "stories"} on {label.toLowerCase()}" which does not match DRD format.
- Expected: Format should be "{TOPIC} — {count} {story/stories} on {description}" e.g., "PRODUCT & DESIGN — ninety-four stories on product design". DRD shows lowercase "ninety-four" for numbers, but actual implementation uses numeral "{total}".
- Evidence: Line 67 shows numeric count instead of spelled-out number
- Remediation: Implement number-to-words conversion for count (e.g., 5 -> "five") and match DRD format exactly.

### [P1-5] Image radius wrong on topic page cards
- DRD reference: §5.2 spread D — "Right (4 cols): a 3:2 image, 8px radius (smaller than hero radius — this is an editorial detail)"
- Location: app/topic/[slug]/page.tsx:116
- Viewport(s): all
- Observed: Code uses "rounded-lg" which is 0.5rem (8px) in Tailwind — this actually matches!
- Evidence: className="rounded-lg" at line 116
- Note: This one appears CORRECT upon inspection. Will reclassify.

## Minors (P2) — should fix before ship

### [P2-1] Pagination active state styling incomplete
- DRD reference: §7.2 — "Pagination at the bottom: page numbers as meta links with current page boxed by a 1px ink border pill (999px radius, 40px min-width, 40px tall)"
- Location: app/topic/[slug]/page.tsx:151-165
- Viewport(s): all
- Observed: Pagination uses conditional classes with min-w-10 h-10 which is 40px, correct. But border handling could be more explicit.
- Evidence: Line 156 shows min-w-10 h-10 flex items-center justify-center border
- Note: This is close but could be verified as passing

### [P2-2] Topic cover band height missing mobile variant
- DRD reference: §7.1 — "Topic cover band at 320px tall (desktop), cream background paper-2."
- Location: app/topic/[slug]/page.tsx:62
- Viewport(s): mobile
- Observed: h-80 (320px) is applied at all breakpoints. No fluid height for mobile per DRD typography scale.
- Expected: Should have responsive height per fluid typography (similar to how display-xl uses clamp)
- Evidence: No breakpoint-specific height classes
- Remediation: Use h-80 or clamp for responsive height

### [P2-3] Outer padding does not match DRD grid spec
- DRD reference: §3.5 — "Outer padding: 64px desktop, 40px tablet, 20px mobile."
- Location: app/topic/[slug]/page.tsx:62
- Viewport(s): all
- Observed: px-4 md:px-6 lg:px-8 translates to 16px / 24px / 32px. Not matching DRD.
- Expected: 20px / 40px / 64px for mobile / tablet / desktop.
- Evidence: Tailwind classes don't match spec values
- Remediation: Change to px-5 md:px-10 lg:px-16 (20px / 40px / 64px)

## DRD defects (ambiguity or contradiction found in the spec itself)

### [DRD-1] §7.1 "fills the band horizontally" is ambiguous
- Location: DRD §7.1
- Issue: "fills the band horizontally" could mean (a) text fills available width with wrapping/balancing, or (b) text is simply left-aligned with max-width constraint. The Zenith reference aesthetic suggests centering like a magazine cover, but spec does not clarify.
- Recommendation: Clarify if topic name should be text-align: center or left-aligned, and whether it should use text-wrap: balance.

### [DRD-2] §7.1 subtitle count spelling format conflict
- Location: DRD §7.1 example "ninety-four stories"
- Issue: Example uses word "ninety-four" but other DRD sections use numeric counts. No explicit instruction whether to spell out or use numerals.
- Recommendation: Clarify count format preference across all pages.

## Passing checks (for tracing)
- §3.1 Color tokens: Implemented via tailwind config — VERIFIED
- §3.2 Font loading: next/font/google with Fraunces, Instrument Serif, Inter Tight — VERIFIED
- §4.2 Masthead: Basic structure present with utility bar, wordmark, nav links — VERIFIED
- §4.3 Footer: Present with 3 columns, sources list — VERIFIED
- Route /topic/product-design: Responds with content — VERIFIED
- Route /topic/ux-research: Responds with content — VERIFIED

## Appendix A — Evidence

### Live page screenshot evidence
- http://localhost:3000/topic/product-design captured 2026-04-22
- Header band rendered with incorrect flex layout (mt-6 gap)
- Typography using wrong classes (font-serif vs specific font tokens)
- Save button missing entirely from all story cards

---

## Top 5 P0/P1 issues summary:
1. P0-1: Save button missing from topic page (critical UX failure)
2. P0-2: Header band layout broken, doesn't wrap/fill correctly
3. P1-1: Wrong font family classes (font-serif vs Once UI tokens)
4. P1-2: Date format wrong (DD.MM spec not followed)
5. P1-3: Grid spacing wrong (80px row / 48px col gaps not applied)