import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SaveButton from "@/components/SaveButton";
import { TOPIC_ORDER, TOPIC_LABELS } from "@/lib/topics";
import { getStoriesByTopic } from "@/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
};

function getImageUrl(story: any) {
  if (story.imageUrl) return story.imageUrl;
  const q = `${story.headline.split(" ").slice(0, 4).join(" ")} ${story.topic}`;
  return `/api/pexels-image?q=${encodeURIComponent(q)}`;
}

export async function generateStaticParams() {
  return TOPIC_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const label = TOPIC_LABELS[slug] || slug;
  return {
    title: `${label} | Daily Digest`,
    description: `All stories about ${label} from Daily Digest.`,
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  
  if (!TOPIC_ORDER.includes(slug)) {
    notFound();
  }

  const stories = getStoriesByTopic(slug);
  const label = TOPIC_LABELS[slug] || slug;

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-24 px-5 md:px-[5vw] lg:px-20">
        <p className="text-[var(--text-muted)]">No stories found for {label}</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-16">
      <div
        className="h-80 flex flex-col justify-center px-5 md:px-[5vw] lg:px-20 border-b border-[var(--border)]"
        style={{ background: "var(--surface-2)" }}
      >
        <h1
          className="text-white font-extrabold uppercase tracking-tight text-wrap balance leading-none"
          style={{
            fontSize: "clamp(40px, 8vw, 96px)",
          }}
        >
          {label}
        </h1>
        <p className="text-[var(--text-muted)] mt-4 text-lg">
          {stories.length} {stories.length === 1 ? "story" : "stories"}
        </p>
      </div>

      <div className="px-5 md:px-[5vw] lg:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story: any) => (
            <article
              key={story.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden transition-all duration-200 hover:border-[var(--border-med)] hover:shadow-elevated flex flex-col"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <Link
                href={`/article/${story.id}?from=${encodeURIComponent(`/topic/${slug}`)}`}
                className="block relative aspect-video overflow-hidden flex-shrink-0"
              >
                <Image
                  src={getImageUrl(story)}
                  alt={story.headline}
                  fill
                  className="object-cover transition-transform duration-400 hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, 50vw"
                />
              </Link>

              <div className="p-4 flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {formatDate(story.publishedAt)}
                </span>

                <Link
                  href={`/article/${story.id}?from=${encodeURIComponent(`/topic/${slug}`)}`}
                >
                  <h3 className="font-semibold leading-snug text-[var(--text-strong)] line-clamp-3 transition-colors duration-150 hover:text-[var(--brand)]">
                    {story.headline}
                  </h3>
                </Link>

                <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                  {story.dek}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {story.source}
                  </span>
                  <SaveButton story={story} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}