import { NextRequest, NextResponse } from "next/server";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";

interface PexelsPhoto {
  src: { large: string };
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "technology";

  if (!PEXELS_API_KEY) {
    return NextResponse.json({ error: "no key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) return NextResponse.json({ error: "pexels error" }, { status: 502 });

    const data = (await res.json()) as PexelsResponse;
    const url = data.photos?.[0]?.src?.large;
    if (!url) return NextResponse.json({ error: "no results" }, { status: 404 });

    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
