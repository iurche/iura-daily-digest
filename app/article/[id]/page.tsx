import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoryById } from '@/lib/digests';
import { getExtractedContent } from '@/lib/extracted-store';
import { extractArticle } from '@/lib/extract';
import ArticleReaderClient from './ArticleReaderClient';
import ChatPanel from '@/components/ChatPanel';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const story = getStoryById(id);
    if (!story) return { title: 'Article Not Found' };
    return {
      title: `${story.headline} | Daily Digest`,
      description: story.dek,
    };
  } catch (err) {
    return { title: 'Article | Daily Digest' };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const story = getStoryById(id);

  if (!story) {
    notFound();
  }

  try {
    // 1. Try to get pre-extracted content from disk
    let content = getExtractedContent(story.sourceUrl);

    // 2. Fallback to runtime extraction if missing
    if (!content) {
      console.log(`[Reader] Content missing for ${story.id}, triggering runtime extraction...`);
      content = await extractArticle(story.sourceUrl);
    }

    const publishedDate = new Date(story.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    console.log(`[Reader] Content for ${story.id}: ${content ? 'Found' : 'Missing'}`);
    const showChat = !!(process.env.GEMINI_API_KEY);

    return (
      <>
        <main className="max-w-[800px] mx-auto px-5 md:px-10 pt-24 pb-12 md:py-20">
          <Suspense fallback={<div>Loading interaction controls...</div>}>
            <ArticleReaderClient story={story} />
          </Suspense>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--brand)]">
                {story.source}
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-med)]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {publishedDate}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1] text-[var(--text-strong)] mb-6 tracking-tight">
              {story.headline}
            </h1>

            {content?.byline && (
              <p className="text-sm font-medium text-[var(--text-muted)] italic">
                By {content.byline}
              </p>
            )}
          </header>

          {content ? (
            <article 
              className="prose prose-dd max-w-none"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface-2)]">
              <p className="text-[var(--text-muted)] mb-4">
                We couldn't extract the full content for this article.
              </p>
              <a 
                href={story.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--brand)] font-bold hover:underline inline-flex items-center gap-2"
              >
                Read on {story.source}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          )}
        </main>

        <Footer />
        
        {showChat && <ChatPanel articleId={story.id} story={story} />}
      </>
    );
  } catch (error: any) {
    console.error("[Reader] Server crash:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-[var(--text-muted)] mb-6">{error.message}</p>
          <a href="/" className="text-[var(--brand)] font-bold">Return to homepage</a>
        </div>
      </div>
    );
  }
}
