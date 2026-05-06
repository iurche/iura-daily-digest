import { GoogleGenerativeAI } from "@google/generative-ai";
import { userProfile } from "./profile";
import { Story } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

if (!process.env.GEMINI_API_KEY) {
  console.warn("[Gemini] GEMINI_API_KEY not set. Chat will be unavailable.");
}

export function buildSystemPrompt(article: Story, extractedContent: string) {
  return `You are a helpful AI assistant for ${userProfile.name}.
Your goal is to help them analyze and extract value from articles.

${userProfile.name}'s profile:
- Role: ${userProfile.role}
- Education: ${userProfile.education}
- Pivot Goal: ${userProfile.pivot}
- Primary Project: ${userProfile.primaryProject}
- Work Context: ${userProfile.workContext}
- Job Search: ${userProfile.jobSearch}

Your Persona:
${userProfile.persona}

Communication Style:
${userProfile.communicationStyle}

Prompt Refinement Mechanism:
${userProfile.promptRefinementInstructions}
(Trigger: ${userProfile.promptRefinementTrigger})

Article context:
- Title: ${article.headline}
- Source: ${article.source}
- Date: ${article.publishedAt}
- Content:
${extractedContent.slice(0, 30000)}

Instructions:
1. Always keep the user's profile and goals in mind.
2. Provide sharp, data-first answers. Use bullets and tables by default.
3. Be as concise as possible.
4. If asked about connections to their work (e.g. Tuza or the Agrotech venture), provide specific, high-level design or product insights.
5. Every claim must include verified numbers where possible — impact, risk, cost, benefit.
6. Proactively flag risks, blind spots, and flawed assumptions in the user's line of inquiry.
`;
}

export function trimMessages(messages: { role: string; content: string }[], limit = 30) {
  if (messages.length <= limit) return messages;
  return messages.slice(-limit);
}

export async function getGeminiResponseStream(systemPrompt: string, history: { role: string; content: string }[]) {
  const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError: any;

  for (const modelName of models) {
    try {
      console.log(`[Gemini] Attempting ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemPrompt
      });

      const lastMessage = history[history.length - 1];
      const pastHistory = history.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const chatSession = model.startChat({
        history: pastHistory
      });

      const result = await chatSession.sendMessageStream(lastMessage.content);
      console.log(`[Gemini] ${modelName} stream started successfully.`);
      return result;
    } catch (err: any) {
      console.error(`[Gemini] ${modelName} failed:`, err.message);
      lastError = err;
      
      const isTemporary = 
        err.message?.includes("503") || 
        err.message?.includes("429") || 
        err.message?.includes("high demand") || 
        err.message?.includes("quota");

      if (isTemporary && modelName !== models[models.length - 1]) {
        console.warn(`[Gemini] ${modelName} temporary failure, falling back...`);
        continue;
      }
      throw err; 
    }
  }

  throw lastError;
}
