# Components

## Masthead
**Purpose:** Site wordmark and issue metadata displayed at the top of every page.
**Props:** `date: string`, `issueNumber: number`
**Usage:** `<Masthead date="2026-04-20" issueNumber={110} />`

## HeroStory
**Purpose:** Full-bleed editorial hero unit for the lead story of each digest.
**Props:** `story: Story`, `date: string`
**Usage:** `<HeroStory story={heroStory} date="2026-04-20" />`
**Notes:** Uses priority image loading. Falls back to topic SVG if no imageUrl. Drop cap applied via CSS `::first-letter` on the dek.

## StoryCard
**Purpose:** Standard card unit for non-hero stories in section grids.
**Props:** `story: Story`, `date: string`
**Usage:** `<StoryCard story={story} date="2026-04-20" />`
**Notes:** Client component. Uses IntersectionObserver for fade-in. Keyboard: Enter opens URL, S saves/unsaves. Images are lazy-loaded with 3:2 aspect ratio.

## TopicSection
**Purpose:** Section container grouping stories by topic with a labeled header and a link to the topic archive.
**Props:** `topic: Topic`, `label: string`, `stories: Story[]`, `date: string`
**Usage:** `<TopicSection topic="product-design" label="Product & Design" stories={[...]} date="2026-04-20" />`

## SaveButton
**Purpose:** Bookmark icon that saves/unsaves a story to localStorage via Zustand shelf store.
**Props:** `storyId: string`
**Usage:** `<SaveButton storyId="2026-04-20-product-design-0" />`
**Notes:** Client component. Hydrates shelf on mount to avoid SSR mismatch. Scale animation on click.

## DateNav
**Purpose:** Previous/next navigation between digest dates with a date picker for jumping to any date.
**Props:** `currentDate: string`, `prevDate: string | null`, `nextDate: string | null`
**Usage:** `<DateNav currentDate="2026-04-20" prevDate="2026-04-19" nextDate={null} />`
**Notes:** Client component. Keyboard: `[` = prev, `]` = next.

## TopicNav
**Purpose:** Horizontal scrollable pill navigation linking to all topic archives plus Today, Archive, and Shelf.
**Props:** `activeTopic?: string` (optional override for active pill)
**Usage:** `<TopicNav />` or `<TopicNav activeTopic="ai-tools" />`
**Notes:** Client component. Auto-detects active topic from pathname.

## ShelfFilters
**Purpose:** Filter controls for the Shelf page — day, topic, source, plus export (JSON/Markdown).
**Props:** `stories: (Story & { date: string })[]`, `onFilter: (filtered) => void`
**Usage:** `<ShelfFilters stories={savedStories} onFilter={setFiltered} />`
**Notes:** Client component. All filter state is local. Export triggers a Blob download.
