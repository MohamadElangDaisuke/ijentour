import { getLiveTourKnowledge } from "@/lib/travelAssistant";
import { validateInput, normalizeText, detectLanguage } from "./normalizer";
import { extractEntities } from "./entityExtractor";
import { classifyIntent } from "./intentClassifier";
import { buildChatbotResponse } from "./responseBuilder";
import { ChatbotResponse, ConversationContext } from "./types";

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

export interface ProcessChatbotOptions {
  messages: ChatMessageInput[];
  context?: ConversationContext;
}

/**
 * Main Orchestrator for Rule-Based Customer Chatbot.
 * Strictly 100% Rule-Based & Live Database-Driven.
 * NO generative AI, LLM, OpenAI, Gemini, or Vector DB.
 */
export async function processChatbotMessage({
  messages,
  context = {},
}: ProcessChatbotOptions): Promise<ChatbotResponse> {
  // 1. Extract and validate latest user message
  const lastUserMsg = messages
    .slice()
    .reverse()
    .find((m) => m.role === "user");

  const rawText = lastUserMsg?.content || "";
  const validation = validateInput(rawText);

  if (!validation.isValid) {
    return {
      success: false,
      message: validation.errorMessage || "Invalid inquiry text.",
      context,
    };
  }

  // 2. Normalize text and detect language
  const normalized = normalizeText(validation.cleanText);
  const language = detectLanguage(normalized, context.language);

  // 3. Fetch live data from Supabase/Prisma database
  // Strictly active packages and FAQs so admin edits are immediately reflected
  const liveKnowledge = await getLiveTourKnowledge();
  const livePackages = liveKnowledge.packages;
  const liveDestinations = liveKnowledge.destinations;
  const liveFaqs = liveKnowledge.faqs;

  // 4. Extract Entities dynamically from live database entities
  const entities = extractEntities(normalized, livePackages, liveDestinations);

  // 5. Classify Intent deterministically
  const classification = classifyIntent(
    normalized,
    entities,
    context,
    language,
    livePackages,
    liveDestinations,
    liveFaqs
  );

  // 6. Build deterministic, DB-grounded response
  const response = buildChatbotResponse(
    classification,
    context,
    livePackages,
    liveDestinations,
    liveFaqs
  );

  return response;
}
