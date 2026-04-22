import { getLatestDigest, getStoriesForTopic } from "./digests";
import { Story, Topic } from "./types";

export function getStories(): Story[] {
  const digest = getLatestDigest();
  if (!digest) return [];
  return digest.stories;
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