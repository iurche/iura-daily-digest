import Hero from "@/components/Hero";
import TopicSection from "@/components/TopicSection";
import Footer from "@/components/Footer";
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

      <Footer />
    </div>
  );
}