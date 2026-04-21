import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDigest, getAllDates } from "@/lib/digests";
import { TOPIC_LABELS } from "@/lib/topic-labels";
import type { Story, Topic } from "@/lib/types";
import HeroStory from "@/components/HeroStory";
import TopicSection from "@/components/TopicSection";
import DateNav from "@/components/DateNav";

export const revalidate = 3600;

type Props = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const digest = getDigest(date);
  if (!digest) return { title: "Not Found" };
  const hero = digest.stories.find((s) => s.id === digest.heroStoryId);
  return {
    title: hero?.headline ?? `Digest — ${date}`,
    description: hero?.dek ?? `Editorial digest for ${date}.`,
    openGraph: {
      title: hero?.headline ?? `Digest — ${date}`,
      description: hero?.dek ?? `Editorial digest for ${date}.`,
      images: hero?.imageUrl ? [{ url: hero.imageUrl }] : [],
    },
  };
}

export async function generateStaticParams() {
  const dates = getAllDates();
  return dates.map((date) => ({ date }));
}

function groupByTopic(stories: Story[]): Map<Topic, Story[]> {
  const map = new Map<Topic, Story[]>();
  for (const story of stories) {
    const existing = map.get(story.topic) ?? [];
    map.set(story.topic, [...existing, story]);
  }
  return map;
}

export default async function DigestPage({ params }: Props) {
  const { date } = await params;
  const digest = getDigest(date);
  if (!digest) notFound();

  const allDates = getAllDates();
  const currentIndex = allDates.indexOf(date);
  const prevDate = allDates[currentIndex + 1] ?? null;
  const nextDate = allDates[currentIndex - 1] ?? null;

  const hero = digest.stories.find((s) => s.id === digest.heroStoryId);
  const nonHeroStories = digest.stories.filter(
    (s) => s.id !== digest.heroStoryId
  );
  const grouped = groupByTopic(nonHeroStories);

  return (
    <div>
      {hero && <HeroStory story={hero} date={digest.date} />}

      <div className="my-10 border-t border-rule" />

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
