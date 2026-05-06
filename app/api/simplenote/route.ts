import { NextRequest, NextResponse } from "next/server";
import { userProfile } from "@/lib/profile";
import crypto from "node:crypto";

// Simplenote / Simperium Configuration (Working Production Keys)
const SIMPLENOTE_APP_ID = "chalk-bump-f49";
const SIMPLENOTE_API_KEY = "c8c2b86337154cdabc989b23e30c6bf4";

// Auto-tagging configuration
const TOPIC_TAG_MAP: Record<string, string> = {
  "product-design": "design",
  "ux-research": "ux",
  "ai-tools": "ai",
  "ai-research": "ai-research",
  "iot-hardware": "iot",
  "aiot": "aiot",
  "smart-agriculture": "agtech",
  "career-signals": "career",
  "in-the-world": "trends"
};

// Priority keywords for domain tags
const DOMAIN_KEYWORDS = {
  healthtech: ["health", "medical", "clinic", "patient", "rheumatology", "tuza"],
  agtech: ["agriculture", "farming", "sensor", "irrigation", "crop", "soil"],
  product: ["design", "ux", "user", "interface", "experience", "prototype"],
  ai: ["machine learning", "llm", "neural", "model", "algorithm", "gemini"],
  business: ["pricing", "revenue", "plg", "growth", "metrics", "market"]
};

// Simperium Authentication
async function authenticateSimperium(email: string, password: string): Promise<string> {
  console.log('[Simperium Auth] Attempting authentication...');
  
  const response = await fetch(`https://auth.simperium.com/1/${SIMPLENOTE_APP_ID}/authorize/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Simperium-API-Key': SIMPLENOTE_API_KEY
    },
    body: JSON.stringify({ username: email, password: password })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Simperium Auth] Failed:', response.status, errorText);
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const result = await response.json();
  if (!result.access_token) {
    throw new Error('No access token received');
  }
  
  console.log('[Simperium Auth] Success');
  return result.access_token;
}

// Create note in Simplenote using Simperium API
async function createNote(
  token: string,
  content: string,
  tags: string[]
): Promise<any> {
  const noteId = crypto.randomUUID();
  const ccid = crypto.randomUUID();
  const nowUnix = Math.floor(Date.now() / 1000);

  const noteData = {
    content: content,
    tags: tags,
    systemTags: ["markdown"],
    creationDate: nowUnix,
    modificationDate: nowUnix,
    deleted: false,
    shareURL: "",
    publishURL: ""
  };

  console.log('[Simperium Create] Creating note with ID:', noteId);
  
  const response = await fetch(`https://api.simperium.com/1/${SIMPLENOTE_APP_ID}/note/i/${noteId}?ccid=${ccid}`, {
    method: 'POST',
    headers: {
      'X-Simperium-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(noteData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Simperium Create] Failed:', response.status, errorText);
    throw new Error(`Failed to create note: ${response.status}`);
  }

  const result = await response.json();
  return { id: noteId, ...result };
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
    const { message, userQuestion, story, timestamp } = body;

    console.log('[Simplenote API] Request received for topic:', story?.topic);

    // Get credentials
    const email = process.env.SIMPLENOTE_EMAIL;
    const password = process.env.SIMPLENOTE_PASSWORD;

    if (!email || !password) {
      throw new Error('Simplenote credentials not configured');
    }

    // Generate note title
    const topicKeyword = extractTopicKeyword(userQuestion, story?.topic || "Insight");
    const dateStr = new Date(timestamp || Date.now()).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const noteTitle = `Q: ${topicKeyword} - ${dateStr}`;

    // Extract action items
    const actionItems = extractActionItems(message);

    // Generate tags
    const tags = generateTags(message, userQuestion, story || {}, timestamp || Date.now());

    // Format content
    const noteContent = formatNote({
      title: noteTitle,
      date: new Date(timestamp || Date.now()).toISOString().split('T')[0],
      story: story || { source: 'Unknown', sourceUrl: '#' },
      userProfile,
      userQuestion,
      aiResponse: message,
      actionItems,
      tags
    });

    // Authenticate and create
    const token = await authenticateSimperium(email, password);
    const result = await createNote(token, noteContent, tags);

    console.log('[Simplenote API] Success! Note ID:', result.id);
    return NextResponse.json({
      success: true,
      noteId: result.id,
      tags: tags
    });

  } catch (error: any) {
    console.error('[Simplenote API] Error:', error.message);
    
    // Return formatted note for clipboard fallback
    const fallbackContent = formatNote({
      title: "Q: " + (body?.userQuestion || "AI Insight").slice(0, 50),
      date: new Date().toISOString().split('T')[0],
      story: body?.story || { source: 'Unknown', sourceUrl: '#' },
      userProfile,
      userQuestion: body?.userQuestion || "Question not available",
      aiResponse: body?.message || "Response not available",
      actionItems: [],
      tags: []
    });

    return NextResponse.json({
      success: false,
      error: error.message || "Failed to save to Simplenote",
      noteContent: fallbackContent
    }, { status: 500 });
  }
}

function extractTopicKeyword(question: string, topic: string): string {
  const lcQuestion = (question || "").toLowerCase();
  if (lcQuestion.includes("tuza")) return "Tuza";
  if (lcQuestion.includes("vistaprint") || lcQuestion.includes("vista")) return "VistaPrint";
  
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some(kw => lcQuestion.includes(kw))) {
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  }
  return TOPIC_TAG_MAP[topic] || topic;
}

function extractActionItems(content: string): string[] {
  const actionItems: string[] = [];
  const actionPhrases = [
    /you should (\w+.*?)(?:\.|$)/gi,
    /consider (\w+.*?)(?:\.|$)/gi,
    /try (\w+.*?)(?:\.|$)/gi,
    /explore (\w+.*?)(?:\.|$)/gi,
    /implement (\w+.*?)(?:\.|$)/gi,
    /focus on (\w+.*?)(?:\.|$)/gi,
    /prioritize (\w+.*?)(?:\.|$)/gi
  ];

  for (const pattern of actionPhrases) {
    const matches = (content || "").matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 100) {
        actionItems.push(match[1].trim());
      }
    }
  }
  return actionItems.slice(0, 5);
}

function generateTags(content: string, question: string, story: any, timestamp: number): string[] {
  const tags: string[] = ["daily-digest", new Date(timestamp).toISOString().split('T')[0]];
  const lcContent = ((content || "") + " " + (question || "")).toLowerCase();
  
  if (story?.topic) {
    tags.push(TOPIC_TAG_MAP[story.topic] || story.topic);
  }
  
  if (lcContent.includes("health") || lcContent.includes("clinic") || lcContent.includes("tuza")) {
    tags.push("healthtech");
  }
  if (lcContent.includes("agr") || lcContent.includes("farm") || lcContent.includes("sensor")) {
    tags.push("agtech");
  }
  if (lcContent.includes("tuza")) tags.push("tuza");
  if (lcContent.includes("vistaprint")) tags.push("vistaprint");
  
  return Array.from(new Set(tags)).slice(0, 7);
}

function formatNote(params: any): string {
  const actionItemsSection = params.actionItems?.length > 0 
    ? `\n## 🎯 Action Items\n${params.actionItems.map((item: string) => `- ${item}`).join('\n')}\n`
    : '';

  return `${params.title}

📅 Date: ${params.date}
📰 Source: ${params.story?.source || 'Daily Digest'}
🔗 Article: ${params.story?.sourceUrl || '#'}
🏷️ Topic: ${params.story?.topic || 'General'}

## Professional Context
Role: ${params.userProfile.role}
Education: ${params.userProfile.education}
Project: ${params.userProfile.primaryProject}
Career Focus: ${params.userProfile.pivot}
Work Context: ${params.userProfile.workContext}

## My Question
${params.userQuestion || 'N/A'}

## AI Insight
${params.aiResponse}
${actionItemsSection}
## Career Relevance
Goals: ${params.userProfile.jobSearch}
Building: Agrotech hardware-software venture

---
Tags: ${params.tags ? params.tags.join(', ') : 'daily-digest'}`;
}