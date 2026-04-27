import { getLatestDigest, getStoriesForTopic, getAllDates, getDigest } from "./digests";
import { Story, Topic } from "./types";

/**
 * Returns stories for the "All" homepage.
 * Now pulls from the last 3 days to ensure a full page even if today's 
 * automated update is small.
 */
export function getStories(): Story[] {
  const dates = getAllDates();
  const allStories: Story[] = [];
  
  // Take stories from the last 3 digests to fill the "All" section
  for (const date of dates.slice(0, 3)) {
    const digest = getDigest(date);
    if (digest) allStories.push(...digest.stories);
  }
  
  // Deduplicate by URL (in case stories move between digests)
  const seen = new Set<string>();
  return allStories.filter((s) => {
    if (!s.sourceUrl || seen.has(s.sourceUrl)) return false;
    seen.add(s.sourceUrl);
    return true;
  }).slice(0, 24); // Cap at 24 to keep the homepage snappy
}

export function getStoriesByTopic(topic: string): Story[] {
  const results = getStoriesForTopic(topic);
  return results.map((r) => r.story);
}

export function getAllTopics(): Topic[] {
  return [
    "product-design",
    "ux-research",
    "ai-tools",
    "ai-research",
    "iot-hardware",
    "aiot",
    "smart-agriculture",
    "career-signals",
    "in-the-world",
  ];
}