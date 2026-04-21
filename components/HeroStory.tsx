import Image from "next/image";
import type { Story } from "@/lib/types";
import { TOPIC_LABELS } from "@/lib/topic-labels";
import SaveButton from "@/components/SaveButton";
import { getFallbackUrl } from "@/lib/fallback";

type HeroStoryProps = {
  story: Story;
  date: string;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HeroStory({ story, date }: HeroStoryProps) {
  const imageUrl = story.imageUrl ?? getFallbackUrl(story.id, story.topic);
  const isLocal = imageUrl.startsWith("/");

  return (
    <article className="relative">
      {/* Image container with 16:9 on desktop, 4:5 on mobile */}
      <div
        className="relative w-full overflow-hidden bg-rule"
        style={{ aspectRatio: "16/9" }}
      >
        {/* On small screens, use 4:5 ratio via padding trick */}
        <style>{`
          @media (max-width: 640px) {
            .hero-image-wrapper {
              aspect-ratio: 4/5 !important;
            }
          }
        `}</style>
        <div
          className="hero-image-wrapper relative w-full h-full"
          style={{ aspectRatio: "16/9" }}
        >
          {isLocal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={story.headline}
              className="absolute inset-0 w-full h-full object-cover"
              width={1200}
              height={675}
            />
          ) : (
            <Image
              src={imageUrl}
              alt={story.headline}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1200px"
            />
          )}
        </div>

        {/* Save button overlay */}
        <div className="absolute top-4 right-4">
          <SaveButton storyId={story.id} />
        </div>

        {/* Image credit */}
        {story.imageCredit && (
          <div className="absolute bottom-2 right-2">
            <p className="font-sans text-xs text-white/70 bg-black/30 px-2 py-0.5 rounded">
              {story.imageCredit}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-6 max-w-3xl mx-auto text-center">
        <p
          className="font-sans text-xs text-red mb-3"
          style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
        >
          {TOPIC_LABELS[story.topic] ?? story.topic}
        </p>

        <a
          href={story.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight group-hover:text-red transition-colors">
            {story.headline}
          </h2>
        </a>

        <p className="drop-cap font-sans text-base sm:text-lg text-ink/80 leading-relaxed mt-4 text-left sm:text-center">
          {story.dek}
        </p>

        <div className="flex items-center justify-center gap-3 mt-4 text-sm text-muted font-sans">
          <span
            style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.7rem" }}
          >
            {story.source}
          </span>
          <span>&middot;</span>
          <span style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>
            {formatDate(date)}
          </span>
        </div>
      </div>
    </article>
  );
}
