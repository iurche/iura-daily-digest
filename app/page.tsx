import Hero from "@/components/Hero";
import TopicSection from "@/components/TopicSection";
import { TOPIC_ORDER, TOPIC_LABELS } from "@/lib/topics";
import { getStories } from "@/lib/api";

export default function HomePage() {
  const stories = getStories();
  
  const heroStory = stories.find((s: any) => s.isHero) || stories[0];
  
  const byTopic = TOPIC_ORDER.reduce((acc, topic) => {
    acc[topic] = stories.filter((s: any) => s.topic === topic && s.id !== heroStory?.id);
    return acc;
  }, {} as Record<string, any[]>);

  const topicsWithStories = TOPIC_ORDER.filter(
    (t) => t !== "product-design" && byTopic[t]?.length > 0
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Hero story={heroStory} />

      <div className="px-5 md:px-[5vw] lg:px-20 py-14">
        <TopicSection
          topic="product-design"
          label={TOPIC_LABELS["product-design"]}
          stories={byTopic["product-design"] || []}
        />

        {topicsWithStories.map((topic) => (
          <TopicSection
            key={topic}
            topic={topic}
            label={TOPIC_LABELS[topic]}
            stories={byTopic[topic] || []}
          />
        ))}
      </div>

      <footer className="border-t border-[var(--border)] px-5 md:px-[5vw] lg:px-20 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[var(--brand)] flex items-center justify-center">
            <span className="text-[8px] font-extrabold text-white">DD</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Daily Digest · Apr 22, 2026 · Issue #204
          </span>
        </div>
        <span className="text-xs text-[var(--text-muted)] hidden sm:block">
          Curated intelligence for product designers building in the AI era
        </span>
      </footer>
    </div>
  );
}