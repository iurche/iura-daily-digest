import { Readability } from '@mozilla/readability';

export type ExtractedContent = {
  url: string;
  title: string;
  byline: string | null;
  content: string;
  excerpt: string | null;
  siteName: string | null;
  extractedAt: string;
};

export async function extractArticle(url: string): Promise<ExtractedContent | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`[Extract] Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      console.warn(`[Extract] Readability failed to parse ${url}`);
      return null;
    }

    return {
      url,
      title: article.title || '',
      byline: article.byline || null,
      content: article.content || '',
      excerpt: article.excerpt || null,
      siteName: article.siteName || null,
      extractedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[Extract] Error extracting ${url}:`, err);
    return null;
  }
}
