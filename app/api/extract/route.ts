import { NextRequest, NextResponse } from 'next/server';
import { extractArticle } from '@/lib/extract';

// Simple in-memory cache for the function lifetime
const cache = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (cache.has(url)) {
      return NextResponse.json(cache.get(url));
    }

    const content = await extractArticle(url);
    if (!content) {
      return NextResponse.json({ error: 'Failed to extract content' }, { status: 422 });
    }

    cache.set(url, content);
    return NextResponse.json(content);
  } catch (err) {
    console.error('[API/Extract] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
