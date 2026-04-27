import Parser from 'rss-parser';
import { checkUrl, checkCategories } from './paywall-detector';

export interface InWorldStory {
  id: string;
  topic: 'in-the-world';
  headline: string;
  dek: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
}

export interface IngestionStats {
  fetched: number;
  dropped_paywall: number;
  dropped_duplicate: number;
  selected: number;
}

const GUARDIAN_SECTIONS = ['technology', 'science', 'business', 'world'];

const RSS_SOURCES = [
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', domain: 'technologyreview.com' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', domain: 'wired.com' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', domain: 'techcrunch.com' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', domain: 'theverge.com' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', domain: 'arstechnica.com' },
  { name: 'Fast Company', url: 'https://www.fastcompany.com/latest/rss', domain: 'fastcompany.com' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss', domain: 'news.ycombinator.com' },
];

const KEYWORD_BLACKLIST = [
  'celebrity', 'kardashian', 'sports', 'football', 'basketball', 'soccer',
  'nfl', 'nba', 'mlb', 'nhl', 'gossip', 'reality tv', 'dating show',
  'box office', 'weekend box', 'movie review',
];

const parser = new Parser();

function isWithin24h(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return now.getTime() - date.getTime() < 24 * 60 * 60 * 1000;
}

function isBlacklisted(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORD_BLACKLIST.some((kw) => lower.includes(kw));
}

function score(story: InWorldStory): number {
  let s = 0;
  if (story.dek && story.dek.split(' ').length > 30) s += 2;
  if (story.dek && story.dek.split(' ').length > 15) s += 1;
  return s;
}

async function fetchGuardian(apiKey: string): Promise<InWorldStory[]> {
  const stories: InWorldStory[] = [];
  for (const section of GUARDIAN_SECTIONS) {
    try {
      const url = `https://content.guardianapis.com/search?section=${section}&show-fields=trailText,headline&page-size=10&api-key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as {
        response: {
          results: Array<{
            id: string;
            webTitle: string;
            webUrl: string;
            webPublicationDate: string;
            fields?: { trailText?: string; headline?: string };
          }>;
        };
      };
      for (const item of data.response.results) {
        if (!isWithin24h(item.webPublicationDate)) continue;
        const paywallCheck = checkUrl(item.webUrl);
        if (paywallCheck.blocked) {
          console.log(`[Guardian] Dropped (paywall): ${item.webTitle} — ${paywallCheck.reason}`);
          continue;
        }
        const headline = item.fields?.headline || item.webTitle;
        if (isBlacklisted(headline)) continue;
        stories.push({
          id: `guardian-${item.id.replace(/\//g, '-')}`,
          topic: 'in-the-world',
          headline,
          dek: item.fields?.trailText || '',
          source: 'The Guardian',
          sourceUrl: item.webUrl,
          publishedAt: item.webPublicationDate,
        });
      }
    } catch (err) {
      console.error(`[Guardian] Error fetching section ${section}:`, err);
    }
  }
  return stories;
}

async function fetchRssFeed(
  sourceName: string,
  feedUrl: string
): Promise<InWorldStory[]> {
  const stories: InWorldStory[] = [];
  try {
    const feed = await parser.parseURL(feedUrl);
    for (const item of feed.items || []) {
      const pubDate = item.pubDate || item.isoDate;
      if (!isWithin24h(pubDate)) continue;
      const url = item.link || '';
      if (!url) continue;
      const urlCheck = checkUrl(url);
      if (urlCheck.blocked) {
        console.log(`[RSS:${sourceName}] Dropped (paywall): ${item.title} — ${urlCheck.reason}`);
        continue;
      }
      const categories = (item.categories || []) as string[];
      const catCheck = checkCategories(categories);
      if (catCheck.blocked) {
        console.log(`[RSS:${sourceName}] Dropped (category): ${item.title} — ${catCheck.reason}`);
        continue;
      }
      const headline = item.title || '';
      if (isBlacklisted(headline)) continue;
      const dek = item.contentSnippet || item.summary || '';
      stories.push({
        id: `rss-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        topic: 'in-the-world',
        headline,
        dek: dek.slice(0, 300),
        source: sourceName,
        sourceUrl: url,
        publishedAt: pubDate || new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error(`[RSS:${sourceName}] Error:`, err);
  }
  return stories;
}

export async function fetchInTheWorld(guardianApiKey?: string): Promise<{
  stories: InWorldStory[];
  stats: IngestionStats;
}> {
  const stats: IngestionStats = {
    fetched: 0,
    dropped_paywall: 0,
    dropped_duplicate: 0,
    selected: 0,
  };

  const allStories: InWorldStory[] = [];

  // Fetch Guardian
  if (guardianApiKey) {
    const guardianStories = await fetchGuardian(guardianApiKey);
    allStories.push(...guardianStories);
  }

  // Fetch RSS feeds
  for (const source of RSS_SOURCES) {
    const rssStories = await fetchRssFeed(source.name, source.url);
    allStories.push(...rssStories);
  }

  stats.fetched = allStories.length;

  // Deduplicate by headline similarity
  const seen = new Set<string>();
  const sourceSeen = new Map<string, number>();
  const deduplicated: InWorldStory[] = [];

  for (const story of allStories) {
    const key = story.headline.toLowerCase().slice(0, 50);
    if (seen.has(key)) {
      stats.dropped_duplicate++;
      continue;
    }
    seen.add(key);
    deduplicated.push(story);
  }

  // Sort by score descending
  deduplicated.sort((a, b) => score(b) - score(a));

  // Select top 12, max 1 per source unless needed
  const selected: InWorldStory[] = [];
  for (const story of deduplicated) {
    if (selected.length >= 12) break;
    const sourceCount = sourceSeen.get(story.source) || 0;
    if (sourceCount >= 1 && selected.length < 10) {
      // Skip second story from same source until we've filled 10 slots
      continue;
    }
    selected.push(story);
    sourceSeen.set(story.source, sourceCount + 1);
  }

  // If not enough, fill up to 12
  if (selected.length < 12) {
    for (const story of deduplicated) {
      if (selected.length >= 12) break;
      if (!selected.includes(story)) {
        selected.push(story);
      }
    }
  }

  stats.selected = selected.length;

  console.log(
    `[InTheWorld] Fetched: ${stats.fetched}, Dropped paywall: ${stats.dropped_paywall}, Dropped duplicate: ${stats.dropped_duplicate}, Selected: ${stats.selected}`
  );

  return { stories: selected, stats };
}
