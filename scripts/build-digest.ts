import fs from 'fs';
import path from 'path';
import { fetchInTheWorld } from '../lib/ingestion/in-the-world';
import { loadSeenUrls, saveSeenUrls, markUrlsAsSeen } from '../lib/seen-urls';
import type { Digest, Story, Topic } from '../lib/types';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || '';

const TODAY = new Date().toISOString().slice(0, 10);
const HEROES_DIR = path.join(process.cwd(), 'public/images/heroes');
const DIGESTS_DIR = path.join(process.cwd(), 'content/digests');

interface UnsplashPhoto {
  urls: { regular: string };
  user: { name: string };
}

interface UnsplashSearchResult {
  results: UnsplashPhoto[];
}

async function generateHeroImage(heroStory: Story): Promise<string | null> {
  const heroPath = path.join(HEROES_DIR, `${TODAY}.png`);

  // Skip if already exists
  if (fs.existsSync(heroPath)) {
    console.log(`[Hero] Using cached hero image: ${heroPath}`);
    return `/images/heroes/${TODAY}.png`;
  }

  if (!GEMINI_API_KEY) {
    console.warn('[Hero] GEMINI_API_KEY not set, skipping hero image generation');
    return null;
  }

  const prompt = `editorial magazine illustration in the style of Esquire or The Atlantic, subject: ${heroStory.headline}, muted palette, painterly, no text, no logos, 16:9`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[Hero] Gemini API error:', err);
      return null;
    }

    const data = (await res.json()) as {
      candidates: Array<{
        content: {
          parts: Array<{ inlineData?: { mimeType: string; data: string } }>;
        };
      }>;
    };

    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );
    if (!imagePart?.inlineData) {
      console.error('[Hero] No image data in Gemini response');
      return null;
    }

    if (!fs.existsSync(HEROES_DIR)) fs.mkdirSync(HEROES_DIR, { recursive: true });
    const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
    fs.writeFileSync(heroPath, buffer);
    console.log(`[Hero] Saved hero image: ${heroPath}`);
    return `/images/heroes/${TODAY}.png`;
  } catch (err) {
    console.error('[Hero] Error generating hero image:', err);
    return null;
  }
}

async function fetchUnsplashImage(
  story: Story
): Promise<{ url: string; credit: string } | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;
  const words = story.headline.split(' ').slice(0, 4).join(' ');
  const query = `${words} ${story.topic}`;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as UnsplashSearchResult;
    const photo = data.results?.[0];
    if (!photo) return null;
    return {
      url: photo.urls.regular,
      credit: `Photo by ${photo.user.name} on Unsplash`,
    };
  } catch {
    return null;
  }
}

interface PexelsPhoto {
  src: { large: string };
  photographer: string;
}

async function fetchPexelsImage(
  story: Story
): Promise<{ url: string; credit: string } | null> {
  if (!PEXELS_API_KEY) return null;
  const words = story.headline.split(' ').slice(0, 4).join(' ');
  const query = `${words} ${story.topic}`;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { photos: PexelsPhoto[] };
    const photo = data.photos?.[0];
    if (!photo) return null;
    return {
      url: photo.src.large,
      credit: `Photo by ${photo.photographer} on Pexels`,
    };
  } catch {
    return null;
  }
}

function generateStoryId(date: string, topic: string, index: number): string {
  return `${date}-${topic}-${index}`;
}

async function main() {
  console.log(`\n=== Daily Digest Build — ${TODAY} ===\n`);

  // 0. Load cross-day seen URLs to prevent duplicate articles
  // Only block URLs that were featured on a *previous* day — same-day re-runs always refresh
  const seenUrls = loadSeenUrls();
  const previousDayUrls = new Set(
    [...seenUrls.entries()]
      .filter(([, date]) => date < TODAY)
      .map(([url]) => url)
  );
  console.log(`[SeenUrls] Loaded ${seenUrls.size} total, ${previousDayUrls.size} from previous days`);

  // 1. Fetch "In the World" stories
  console.log('[Step 1] Fetching "In the World" stories...');
  const { stories: inWorldStories, stats: inWorldStats } =
    await fetchInTheWorld(GUARDIAN_API_KEY || undefined);
  console.log('[InTheWorld Stats]', inWorldStats);

  // 2. Load existing digest if available (for seeded topics)
  const existingPath = path.join(DIGESTS_DIR, `${TODAY}.json`);
  let existingDigest: Digest | null = null;
  if (fs.existsSync(existingPath)) {
    try {
      existingDigest = JSON.parse(fs.readFileSync(existingPath, 'utf-8')) as Digest;
      console.log(`[Digest] Loaded existing digest for ${TODAY}`);
    } catch {
      console.warn('[Digest] Could not parse existing digest');
    }
  }

  // 3. Assemble base stories from today's existing digest — only filter cross-*day* dupes
  const baseStories: Story[] = (existingDigest
    ? existingDigest.stories.filter((s) => s.topic !== 'in-the-world')
    : []
  ).filter((s) => {
    if (s.sourceUrl && previousDayUrls.has(s.sourceUrl)) {
      console.log(`[SeenUrls] Skipping previously-featured story: "${s.headline}"`);
      return false;
    }
    return true;
  });

  // 4. Tag in-the-world stories with IDs — filter only cross-day dupes
  const taggedInWorld: Story[] = inWorldStories
    .filter((s) => {
      if (s.sourceUrl && previousDayUrls.has(s.sourceUrl)) {
        console.log(`[SeenUrls] Skipping previously-featured in-the-world: "${s.headline}"`);
        return false;
      }
      return true;
    })
    .map((s, i) => ({
      ...s,
      id: generateStoryId(TODAY, 'in-the-world', i),
    }));

  const allStories: Story[] = [...baseStories, ...taggedInWorld];

  // 5. Fetch images for non-hero stories (Unsplash + Pexels)
  console.log(`\n[Step 2] Fetching images for ${allStories.length} stories...`);
  let unsplashFetched = 0;
  let pexelsFetched = 0;
  let skipped = 0;

  for (let i = 0; i < allStories.length; i++) {
    const story = allStories[i];
    // Force refresh images for testing - remove this in production
    // if (story.imageUrl) continue; 

    // Try Unsplash first
    let img = await fetchUnsplashImage(story);
    if (img) {
      allStories[i] = { ...story, imageUrl: img.url, imageCredit: img.credit };
      unsplashFetched++;
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    // Try Pexels if Unsplash fails
    img = await fetchPexelsImage(story);
    if (img) {
      allStories[i] = { ...story, imageUrl: img.url, imageCredit: img.credit };
      pexelsFetched++;
      continue;
    }

    skipped++;
  }

  console.log(`[Images] Unsplash: ${unsplashFetched}, Pexels: ${pexelsFetched}, Skipped: ${skipped}`);

  // 6. Determine hero story
  const heroStory =
    allStories.find((s) => s.isHero) ||
    allStories.find((s) => s.topic === 'product-design') ||
    allStories[0];

  if (!heroStory) {
    console.error('[Digest] No stories to build digest from. Exiting.');
    process.exit(1);
  }

  // 7. Generate hero image
  console.log('\n[Step 3] Generating hero image...');
  const heroImageUrl = await generateHeroImage(heroStory);
  if (heroImageUrl) {
    const idx = allStories.findIndex((s) => s.id === heroStory.id);
    if (idx !== -1) {
      allStories[idx] = { ...allStories[idx], imageUrl: heroImageUrl };
    }
  }

  // 8. Assemble final digest
  const digest: Digest = {
    date: TODAY,
    heroStoryId: heroStory.id,
    stories: allStories,
  };

  // 9. Write to file
  if (!fs.existsSync(DIGESTS_DIR)) fs.mkdirSync(DIGESTS_DIR, { recursive: true });
  fs.writeFileSync(existingPath, JSON.stringify(digest, null, 2), 'utf-8');
  console.log(`\n[Done] Digest written to ${existingPath}`);

  // 10. Mark all featured URLs as seen (persists cross-day deduplication)
  const featuredUrls = allStories.map((s) => s.sourceUrl).filter(Boolean) as string[];
  markUrlsAsSeen(seenUrls, featuredUrls, TODAY);
  saveSeenUrls(seenUrls);

  // 11. Stats summary
  console.log('\n=== Build Summary ===');
  console.log(`Date: ${TODAY}`);
  console.log(`Total stories: ${allStories.length}`);
  console.log(`Hero: ${heroStory.headline}`);
  console.log(`Hero image: ${heroImageUrl || 'not generated'}`);
  console.log(`InTheWorld — fetched: ${inWorldStats.fetched}, paywall drops: ${inWorldStats.dropped_paywall}, dupes: ${inWorldStats.dropped_duplicate}, selected: ${inWorldStats.selected}`);
  console.log(`Images — Unsplash: ${unsplashFetched}, Pexels: ${pexelsFetched}, Skipped: ${skipped}`);
  console.log('===================\n');
}

main().catch((err) => {
  console.error('[Fatal]', err);
  process.exit(1);
});
