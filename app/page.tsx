import type { Metadata } from "next";
import { getLatestDigest, getAllDates } from "@/lib/digests";
import { TOPIC_LABELS } from "@/lib/topic-labels";
import type { Story, Topic } from "@/lib/types";
import HeroStory from "@/components/HeroStory";
import TopicSection from "@/components/TopicSection";
import DateNav from "@/components/DateNav";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const digest = getLatestDigest();
  if (!digest) return { title: "Iura's Daily Digest" };
  const hero = digest.stories.find((s) => s.id === digest.heroStoryId);
  return {
    title: hero?.headline ?? "Today's Digest",
    description: hero?.dek ?? "Your daily editorial briefing.",
    openGraph: {
      title: hero?.headline ?? "Today's Digest",
      description: hero?.dek ?? "Your daily editorial briefing.",
      images: hero?.imageUrl ? [{ url: hero.imageUrl }] : [],
    },
  };
}

function groupByTopic(stories: Story[]): Map<Topic, Story[]> {
  const map = new Map<Topic, Story[]>();
  for (const story of stories) {
    const existing = map.get(story.topic) ?? [];
    map.set(story.topic, [...existing, story]);
  }
  return map;
}

export default function HomePage() {
  const digest = getLatestDigest();
  const allDates = getAllDates();

  if (!digest) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="font-serif text-4xl text-gray-900 mb-4">
          No digest available yet
        </h1>
        <p className="text-gray-500 font-sans text-base max-w-md">
          The morning pipeline hasn&apos;t run yet. Run{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
            pnpm build-digest
          </code>{" "}
          to generate today&apos;s digest.
        </p>
      </div>
    );
  }

  const hero = digest.stories.find((s) => s.id === digest.heroStoryId);
  const nonHeroStories = digest.stories.filter(
    (s) => s.id !== digest.heroStoryId
  );
  const grouped = groupByTopic(nonHeroStories);

  const currentIndex = allDates.indexOf(digest.date);
  const prevDate = allDates[currentIndex + 1] ?? null;
  const nextDate = allDates[currentIndex - 1] ?? null;

  return (
    <div>
      {hero && <HeroStory story={hero} date={digest.date} />}

      <div className="my-10 border-t border-gray-200" />

      {Array.from(grouped.entries()).map(([topic, stories]) => (
        <TopicSection
          key={topic}
          topic={topic}
          label={TOPIC_LABELS[topic] ?? topic}
          stories={stories}
          date={digest.date}
        />
      ))}

      <div className="mt-16">
        <DateNav
          currentDate={digest.date}
          prevDate={prevDate}
          nextDate={nextDate}
        />
      </div>
    </div>
  );
}
