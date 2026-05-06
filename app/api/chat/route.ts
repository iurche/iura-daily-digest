import { NextRequest, NextResponse } from "next/server";
import { getStoryById } from "@/lib/digests";
import { getExtractedContent } from "@/lib/extracted-store";
import { buildSystemPrompt, trimMessages, getGeminiResponseStream } from "@/lib/gemini";



export async function POST(req: NextRequest) {
  try {
    const { articleId, messages } = await req.json();

    if (!articleId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const story = await getStoryById(articleId);
    if (!story) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const extractedContent = await getExtractedContent(story.sourceUrl);
    if (!extractedContent) {
      return NextResponse.json({ error: "Article has no extracted content" }, { status: 400 });
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
