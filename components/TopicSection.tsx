"use client";

import StoryCard from "./StoryCard";

type Story = {
  id: string;
  topic: string;
  headline: string;
  dek: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
};

type TopicSectionProps = {
  topic: string;
  label: string;
  stories: Story[];
};

export default function TopicSection({ topic, label, stories }: TopicSectionProps) {
  if (!stories.length) return null;

  const cols = stories.length >= 3 ? 3 : stories.length === 2 ? 2 : 1;

  return (
    <section className="mb-14">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
        <div className="w-[3px] h-[18px] rounded-full bg-[var(--brand)] flex-shrink-0" />
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {label}
        </h2>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {stories.map((story, i) => (
          <StoryCard key={story.id} story={story} delay={i * 60} />
        ))}
      </div>
    </section>
  );
}