import fs from "fs";
import path from "path";
import { Digest, Story, Topic } from "./types";

const DIGESTS_DIR = path.join(process.cwd(), "content/digests");

export function getAllDates(): string[] {
  if (!fs.existsSync(DIGESTS_DIR)) return [];
  return fs
    .readdirSync(DIGESTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}

export function getDigest(date: string): Digest | null {
  const filePath = path.join(DIGESTS_DIR, `${date}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Digest;
  } catch {
    return null;
  }
}

export function getLatestDigest(): Digest | null {
  const dates = getAllDates();
  if (dates.length === 0) return null;
  return getDigest(dates[0]);
}

export function getStoriesForTopic(
  topic: string
): { story: Story; date: string }[] {
  const dates = getAllDates();
  const results: { story: Story; date: string }[] = [];
  for (const date of dates) {
    const digest = getDigest(date);
    if (!digest) continue;
    for (const story of digest.stories) {
      if (story.topic === (topic as Topic)) {
        results.push({ story, date });
      }
    }
  }
  return results;
}
export function getStoryById(id: string): Story | null {
  const dates = getAllDates();
  for (const date of dates) {
    const digest = getDigest(date);
    if (!digest) continue;
    const story = digest.stories.find((s) => s.id === id);
    if (story) return story;
  }
  return null;
}
