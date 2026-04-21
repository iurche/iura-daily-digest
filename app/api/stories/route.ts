import { NextResponse } from "next/server";
import { getAllDates, getDigest } from "@/lib/digests";
import type { Story } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET() {
  const dates = getAllDates();
  const stories: (Story & { date: string })[] = [];

  for (const date of dates) {
    const digest = getDigest(date);
    if (!digest) continue;
    for (const story of digest.stories) {
      stories.push({ ...story, date });
    }
  }

  return NextResponse.json({ stories });
}
