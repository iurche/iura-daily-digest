"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SaveButton from "./SaveButton";
import { TOPIC_LABELS } from "@/lib/topics";

type Story = {
  id: string;
  topic: string;
  headline: string;
  dek: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
};

type HeroProps = {
  story: Story;
};

export default function Hero({ story }: HeroProps) {
  const pexelsSrc = `/api/pexels-image?q=${encodeURIComponent(story.headline.split(" ").slice(0, 4).join(" ") + " " + story.topic)}`;
  const [imgSrc, setImgSrc] = useState(story.imageUrl || pexelsSrc);

  return (
    <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
      <Image
        src={imgSrc}
        alt={story.headline}
        fill
        priority
        className="object-cover"
        onError={() => setImgSrc(pexelsSrc)}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,5,.98) 0%, rgba(5,5,5,.6) 45%, rgba(5,5,5,.15) 100%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 px-5 md:px-[5vw] lg:px-20 pb-14">
        <div className="max-w-[820px]">
          <div className="fade-up flex items-center gap-2.5 mb-4.5">
            <span className="bg-[var(--brand)] text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md">
              {TOPIC_LABELS[story.topic]}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Cover Story
            </span>
          </div>

          <Link
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h1
              className="fade-up-2 text-white mb-4.5 text-wrap balance transition-colors duration-150 hover:text-[var(--brand-text)]"
              style={{
                fontSize: "clamp(28px, 4.5vw, 58px)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {story.headline}
            </h1>
          </Link>

          <p
            className="fade-up-3 text-white/65 mb-6 max-w-[600px] leading-relaxed"
            style={{
              fontSize: "clamp(14px, 1.6vw, 18px)",
            }}
          >
            {story.dek}
          </p>

          <div className="fade-up-3 flex items-center gap-4">
            <Link
              href={story.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[var(--brand)] text-white rounded-lg px-5 py-2.5 text-sm font-bold transition-opacity duration-150 hover:opacity-85"
            >
              Read story
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
            <SaveButton story={story} size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}