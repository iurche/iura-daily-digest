import type { Story, Topic } from "@/lib/types";
import StoryCard from "@/components/StoryCard";
import Link from "next/link";

type TopicSectionProps = {
  topic: Topic;
  label: string;
  stories: Story[];
  date: string;
};

export default function TopicSection({
  topic,
  label,
  stories,
  date,
}: TopicSectionProps) {
  if (stories.length === 0) return null;

  return (
    <section className="mb-14" aria-labelledby={`section-${topic}`}>
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-3">
        <h2
          id={`section-${topic}`}
          className="font-sans text-xs text-gray-900"
          style={{
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {label}
        </h2>
        <Link
          href={`/topic/${topic}`}
          className="font-sans text-xs text-gray-500 hover:text-gray-600 transition-colors ml-auto"
          style={{ letterSpacing: "0.05em" }}
        >
          All {label} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} date={date} />
        ))}
      </div>
    </section>
  );
}
