import { NextRequest, NextResponse } from "next/server";
import { userProfile } from "@/lib/profile";

// Note: The simplenote package we installed seems to be very old and doesn't match the expected API
// We'll use the HTTP API directly instead

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

// Simplenote API authentication
async function authenticateSimplenote(email: string, password: string): Promise<string> {
  const authString = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  const authBase64 = Buffer.from(authString).toString('base64');
  
  const response = await fetch('https://simple-note.appspot.com/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: authBase64
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Simplenote');
  }

  return await response.text();
}

// Create note in Simplenote
async function createSimplenoteNote(
  token: string,
  email: string,
  content: string,
  tags: string[]
): Promise<any> {
  const note = {
    content: content,
    tags: tags,
    systemTags: [],
    creationDate: Math.floor(Date.now() / 1000),
    modificationDate: Math.floor(Date.now() / 1000)
  };

  const response = await fetch(
    `https://simple-note.appspot.com/api2/data?auth=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create note in Simplenote');
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { message, userQuestion, story, timestamp } = await req.json();

    // Get credentials from environment variables
    const email = process.env.SIMPLENOTE_EMAIL;
    const password = process.env.SIMPLENOTE_PASSWORD;

    if (!email || !password) {
      throw new Error('Simplenote credentials not configured');
    }

    // Generate note title (Custom format: Q: [topic] - [date])
    const topicKeyword = extractTopicKeyword(userQuestion, story.topic);
    const dateStr = new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const noteTitle = `Q: ${topicKeyword} - ${dateStr}`;

    // Extract action items from Gemini's response
    const actionItems = extractActionItems(message);

    // Generate tags (conservative: 5-7 tags, prioritizing domain tags)
    const tags = generateTags(message, userQuestion, story, timestamp);

    // Format the note with all context
    const noteContent = formatNote({
      title: noteTitle,
      date: new Date(timestamp).toISOString().split('T')[0],
      story,
      userProfile,
      userQuestion,
      aiResponse: message,
      actionItems,
      tags
    });

    // Authenticate and create note
    const token = await authenticateSimplenote(email, password);
    const result = await createSimplenoteNote(token, email, noteContent, tags);

    return NextResponse.json({
      success: true,
      noteId: result.key,
      tags: tags
    });

  } catch (error: any) {
    console.error('Simplenote API error:', error);
    
    // Return formatted note for clipboard fallback
    const { message, userQuestion, story, timestamp } = await req.json();
    const fallbackContent = formatNote({
      title: "Q: " + userQuestion.slice(0, 50),
      date: new Date().toISOString().split('T')[0],
      story: story,
      userProfile,
      userQuestion: userQuestion,
      aiResponse: message,
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
  // Smart extraction of main topic from question
  const lcQuestion = question.toLowerCase();
  
  // Check for project mentions
  if (lcQuestion.includes("tuza")) return "Tuza";
  if (lcQuestion.includes("vistaprint") || lcQuestion.includes("vista")) return "VistaPrint";
  
  // Check for domain keywords
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some(kw => lcQuestion.includes(kw))) {
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  }
  
  // Fallback to article topic
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
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 100) {
        actionItems.push(match[1].trim());
      }
    }
  }

  return actionItems.slice(0, 5); // Max 5 action items
}

function generateTags(
  content: string, 
  question: string, 
  story: any, 
  timestamp: number
): string[] {
  const tags: string[] = [];
  const lcContent = (content + " " + question).toLowerCase();
  
  // Fixed tags (3)
  tags.push("daily-digest");
  tags.push(new Date(timestamp).toISOString().split('T')[0]); // YYYY-MM-DD
  tags.push(TOPIC_TAG_MAP[story.topic] || story.topic);
  
  // Domain tags (prioritized, 2-4 additional)
  const domainTags: string[] = [];
  
  // Check for domain keywords
  if (lcContent.includes("health") || lcContent.includes("clinic") || 
      lcContent.includes("patient") || lcContent.includes("rheumatology") ||
      lcContent.includes("tuza")) {
    domainTags.push("healthtech");
  }
  
  if (lcContent.includes("agr") || lcContent.includes("farm") || 
      lcContent.includes("sensor") || lcContent.includes("irrigation") ||
      lcContent.includes("crop")) {
    domainTags.push("agtech");
  }
  
  // Check for project mentions
  if (lcContent.includes("tuza")) domainTags.push("tuza");
  if (lcContent.includes("vistaprint")) domainTags.push("vistaprint");
  
  // Add domain tags (up to 4 to keep total under 7)
  tags.push(...domainTags.slice(0, 4));
  
  return tags.slice(0, 7); // Ensure max 7 tags
}

function formatNote(params: any): string {
  const actionItemsSection = params.actionItems && params.actionItems.length > 0 
    ? `\n## 🎯 Action Items\n${params.actionItems.map((item: string) => `- ${item}`).join('\n')}\n`
    : '';

  return `# ${params.title}

📅 Date: ${params.date}
📰 Source: ${params.story.source}
🔗 Article: ${params.story.sourceUrl}
🏷️ Topic: ${params.story.topic}

## Professional Context
Role: ${params.userProfile.role}
Education: ${params.userProfile.education}
Project: ${params.userProfile.primaryProject}
Career Focus: ${params.userProfile.pivot}
Work Context: ${params.userProfile.workContext}

## My Question
${params.userQuestion}

## AI Insight
${params.aiResponse}
${actionItemsSection}
## Career Relevance
Goals: ${params.userProfile.jobSearch}
Building: Agrotech hardware-software venture

---
Tags: ${params.tags ? params.tags.join(', ') : 'daily-digest'}`;
}