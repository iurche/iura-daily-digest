import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoriesForTopic } from "@/lib/digests";
import { TOPIC_LABELS } from "@/lib/topic-labels";
import type { Topic } from "@/lib/types";
import StoryCard from "@/components/StoryCard";

export const revalidate = 3600;

const PAGE_SIZE = 20;
const VALID_TOPICS = [
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

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = TOPIC_LABELS[slug];
  if (!label) return { title: "Topic Not Found" };
  return {
    title: label,
    description: `All stories about ${label} from Iura's Daily Digest.`,
  };
}

export async function generateStaticParams() {
  return VALID_TOPICS.map((slug) => ({ slug }));
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  if (!VALID_TOPICS.includes(slug)) notFound();

  const topic = slug as Topic;
  const label = TOPIC_LABELS[topic] ?? topic;
  const allStories = getStoriesForTopic(topic);
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const total = allStories.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginated = allStories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-8 border-b border-rule pb-6">
        <p className="text-xs uppercase tracking-widest text-muted font-sans mb-1">
          Topic
        </p>
        <h1 className="font-serif text-4xl text-ink">{label}</h1>
        <p className="text-muted text-sm font-sans mt-2">
          {total} {total === 1 ? "story" : "stories"} across all issues
        </p>
      </div>

      {paginated.length === 0 ? (
        <p className="text-muted font-sans text-base">
          No stories found for this topic yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginated.map(({ story, date }) => (
            <StoryCard key={story.id} story={story} date={date} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12 font-sans text-sm">
          {page > 1 && (
            <a
              href={`/topic/${slug}?page=${page - 1}`}
              className="px-4 py-2 border border-rule text-ink hover:bg-rule transition-colors"
            >
              &larr; Previous
            </a>
          )}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/topic/${slug}?page=${page + 1}`}
              className="px-4 py-2 border border-rule text-ink hover:bg-rule transition-colors"
            >
              Next &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
}
