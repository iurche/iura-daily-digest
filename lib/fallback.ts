// Returns a deterministic, beautiful editorial photo for any story.
// Uses Lorem Picsum — free, no API key, same story always gets same photo.
export function getFallbackUrl(storyId: string, _topic: string): string {
  const seed = encodeURIComponent(storyId);
  return `https://picsum.photos/seed/${seed}/800/534`;
}
