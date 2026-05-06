import { GoogleGenerativeAI } from "@google/generative-ai";
import { userProfile } from "./profile";
import { Story } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function buildSystemPrompt(article: Story, extractedContent: string) {
  return `You are a helpful AI assistant for ${userProfile.name}.
Your goal is to help them analyze and extract value from articles.

${userProfile.name}'s profile:
- Role: ${userProfile.role}
- Education: ${userProfile.education}
- Primary Project: ${userProfile.primaryProject}
- Interests: ${userProfile.interests.join(", ")}
- Goals: ${userProfile.goals.join(", ")}

Communication Style: ${userProfile.communicationStyle}

Article context:
- Title: ${article.headline}
- Source: ${article.source}
- Date: ${article.publishedAt}
- Content:
${extractedContent.slice(0, 30000)}

Instructions:
1. Always keep the user's profile and goals in mind.
2. Provide sharp, data-first answers. Use bullets and tables where appropriate.
3. Be as concise as possible.
4. If asked about connections to their work (e.g. Tuza), provide specific, high-level design or product insights.
`;
}

export function trimMessages(messages: { role: string; content: string }[], limit = 30) {
  if (messages.length <= limit) return messages;
  
  // Keep the last 'limit' messages
  // We want to ensure we don't break a pair if possible, but the limit is hard.
  // Usually role alternate: user, assistant, user, assistant...
  return messages.slice(-limit);
}

export async function getGeminiResponseStream(systemPrompt: string, history: { role: string; content: string }[]) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt
  });

  const chat = model.startChat({
    history: history.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }))
  });

  // The last message is the one we just sent, but startChat expects history EXCLUDING the last one
  // Wait, no, startChat history is the past. We then call sendMessage.
  // Actually, it's easier to just pass the last message to sendMessage.
  const lastMessage = history[history.length - 1];
  const pastHistory = history.slice(0, -1).map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }]
  }));

  const chatSession = model.startChat({
    history: pastHistory
  });

  return chatSession.sendMessageStream(lastMessage.content);
}
