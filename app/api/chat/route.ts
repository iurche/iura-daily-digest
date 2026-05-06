import { NextRequest, NextResponse } from "next/server";
import { getStoryById } from "@/lib/digests";
import { getExtractedContent } from "@/lib/extracted-store";
import { buildSystemPrompt, trimMessages, getGeminiResponseStream } from "@/lib/gemini";
import { extractArticle } from "@/lib/extract";

export async function POST(req: NextRequest) {
  try {
    const { articleId, messages } = await req.json();

    if (!articleId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const story = getStoryById(articleId);
    if (!story) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    let extractedContent = getExtractedContent(story.sourceUrl);
    
    // Fallback to runtime extraction if missing
    if (!extractedContent) {
      console.log(`[Chat API] Content missing for ${story.id}, triggering extraction...`);
      extractedContent = await extractArticle(story.sourceUrl);
    }

    if (!extractedContent) {
      return NextResponse.json({ error: "Failed to extract article content for analysis." }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(story, extractedContent.content);
    const trimmedHistory = trimMessages(messages);

    const stream = await getGeminiResponseStream(systemPrompt, trimmedHistory);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("[Chat API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
