/**
 * Cross-day duplicate prevention.
 *
 * Maintains a rolling set of source URLs that have already been featured in
 * a previous digest. The set is persisted to `content/seen-urls.json` in the
 * repo, so it survives across pipeline runs (each run reads → filters → writes).
 *
 * Only the last RETENTION_DAYS worth of entries are kept so the file stays
 * small and articles can recur after a reasonable cooldown period.
 */

import fs from 'fs';
import path from 'path';

/** Days after which a URL is allowed to be featured again. */
const RETENTION_DAYS = 30;

const SEEN_URLS_PATH = path.join(process.cwd(), 'content', 'seen-urls.json');

interface SeenEntry {
  url: string;
  /** ISO date string (YYYY-MM-DD) when this URL was first featured. */
  date: string;
}

/** Load the current set of seen URLs (url → date featured). */
export function loadSeenUrls(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(SEEN_URLS_PATH)) return map;
  try {
    const raw = fs.readFileSync(SEEN_URLS_PATH, 'utf-8');
    const entries = JSON.parse(raw) as SeenEntry[];
    for (const e of entries) {
      map.set(e.url, e.date);
    }
  } catch {
    console.warn('[SeenUrls] Could not parse seen-urls.json — starting fresh');
  }
  return map;
}

/** Persist the updated seen-URL map, pruning entries older than RETENTION_DAYS. */
export function saveSeenUrls(map: Map<string, string>): void {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const entries: SeenEntry[] = [];
  for (const [url, date] of map.entries()) {
    if (new Date(date) >= cutoff) {
      entries.push({ url, date });
    }
  }

  const dir = path.dirname(SEEN_URLS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SEEN_URLS_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`[SeenUrls] Saved ${entries.length} entries (${RETENTION_DAYS}-day window)`);
}

/** Register a set of URLs as featured today. */
export function markUrlsAsSeen(map: Map<string, string>, urls: string[], today: string): void {
  for (const url of urls) {
    if (url) map.set(url, today);
  }
}
