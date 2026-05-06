'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import SaveButton from '@/components/SaveButton';
import { Story } from '@/lib/types';

type ArticleReaderClientProps = {
  story: Story;
};

export default function ArticleReaderClient({ story }: ArticleReaderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const handleBack = () => {
    if (from) {
      router.push(from);
    } else if (document.referrer && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex items-center justify-between mb-12">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="flex items-center gap-6">
        <a
          href={story.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors"
        >
          View original
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
        <SaveButton story={story} size="lg" />
      </div>
    </div>
  );
}
