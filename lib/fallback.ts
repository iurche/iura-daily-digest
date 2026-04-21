// Deterministic hash to pick a fallback image index from 0–7
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getFallbackUrl(storyId: string, topic: string): string {
  const index = simpleHash(storyId) % 8;
  return `/images/fallback/${topic}/${index}.svg`;
}
