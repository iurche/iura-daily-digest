/**
 * /api/shelf — server-side proxy for GitHub Gist shelf storage.
 *
 * Keeps the GitHub token server-side (never exposed to the browser).
 * GET  → fetch current shelf from Gist → return JSON array
 * POST → replace shelf in Gist with provided JSON body
 */

import { NextRequest, NextResponse } from 'next/server';

const GIST_ID = process.env.SHELF_GIST_ID!;
const GITHUB_TOKEN = process.env.SHELF_GITHUB_TOKEN!;
const FILENAME = 'shelf.json';

const GIST_URL = `https://api.github.com/gists/${GIST_ID}`;

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

export async function GET() {
  if (!GIST_ID || !GITHUB_TOKEN) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    const res = await fetch(GIST_URL, { headers, next: { revalidate: 0 } });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const data = await res.json();
    const raw = data?.files?.[FILENAME]?.content ?? '[]';
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  if (!GIST_ID || !GITHUB_TOKEN) {
    return NextResponse.json({ ok: false, reason: 'not configured' });
  }
  try {
    const body = await req.json();
    const res = await fetch(GIST_URL, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        files: { [FILENAME]: { content: JSON.stringify(body) } },
      }),
    });
    return NextResponse.json({ ok: res.ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
