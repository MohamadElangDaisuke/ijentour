import { Type } from "@google/genai";
import { callGeminiWithFallback } from "../gemini";
import {
  getAllActivePackages,
  getAllDestinations,
  getAllActiveFaqs,
  getUpcomingSchedules,
  OFFICIAL_KNOWLEDGE_BASE,
  searchKnowledgeBase,
} from "./tools";
import {
  detectPromptInjection,
  checkTopicRelevance,
  getOffTopicResponse,
  groundPackageRecommendations,
  validateAndClassifyInput,
  CLARIFICATION_FALLBACK_EN,
  CLARIFICATION_FALLBACK_ID,
} from "./validation";
import {
  detectLanguage,
  resolveContextualQuery,
  updateContextWithTurn,
  HybridConversationContext,
} from "./context";
import { buildSystemInstruction, buildFactualContextPrompt } from "./prompts";
import { determineSmartHandoff, HandoffDecision } from "@/lib/chatbot/handoff";
import { executeDeterministicFallback } from "@/lib/chatbot/fallback";
import { logChatbotEvent } from "@/lib/chatbot/tracking";
import { normalizeText } from "@/lib/ruleEngine/normalizer";

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

export interface HybridChatbotOptions {
  messages: ChatMessageInput[];
  context?: HybridConversationContext;
}

export interface HybridChatbotResponse {
  success: boolean;
  message: string;
  recommendedPackages?: any[];
  comparisonPackages?: any[];
  customTrip?: any;
  suggestedPrompts?: string[];
  handoff?: HandoffDecision;
  context: HybridConversationContext;
  source: "gemini_hybrid" | "deterministic_fallback" | "guardrail_rejected";
}

/**
 * Main Full Hybrid AI Chatbot Orchestrator.
 * Combines Gemini AI (for NLU, context, and response structuring) with
 * Backend Tools & Deterministic Database Grounding.
 */
export async function processHybridChatMessage(
  options: HybridChatbotOptions
): Promise<HybridChatbotResponse> {
  const startTime = Date.now();
  const { messages, context = {} } = options;

  // 1. Extract latest user message
  const userMessages = messages.filter((m) => m.role === "user");
  const lastUserMsg = userMessages[userMessages.length - 1];
  const rawQuery = lastUserMsg?.content?.trim() || "";

  if (!rawQuery) {
    return {
      success: false,
      message: "Please provide a valid inquiry message.",
      context,
      source: "guardrail_rejected",
    };
  }

  // Normalize typos and colloquial slang
  const normalizedQuery = normalizeText(rawQuery);

  // 2. Language Detection
  const detectedLang = detectLanguage(normalizedQuery, context.language);

  // 3. Prompt Injection Defense
  const injectionCheck = detectPromptInjection(rawQuery);
  if (injectionCheck.isInjection) {
    const politeRejection =
      "Sorry, this request cannot be processed. I am exclusively designed to assist with Ijen Tour services, travel itineraries, and packages.";

    logChatbotEvent({
      timestamp: new Date().toISOString(),
      source: "guardrail_rejected",
      language: "en",
      queryLength: rawQuery.length,
      durationMs: Date.now() - startTime,
      recommendedCount: 0,
      hasError: true,
    });

    return {
      success: true,
      message: politeRejection,
      context,
      source: "guardrail_rejected",
    };
  }

  // 4. Pre-Gemini Input Validation & Intent Detection
  // Validates input length/meaningfulness and classifies intent early.
  // Rejects single character inputs ('p', 'h', 'a') and random symbols without calling Gemini.
  const validationResult = validateAndClassifyInput({
    rawQuery,
    normalizedQuery,
    language: detectedLang,
    context,
    history: messages,
  });

  const language = validationResult.language;

  // Early response for non-tour inquiry intents (UNCLEAR, GREETING, ACKNOWLEDGEMENT, FOLLOW_UP_ISOLATED, OUT_OF_TOPIC)
  if (validationResult.intent !== "TOUR_INQUIRY" && validationResult.intent !== "FOLLOW_UP") {
    const handoff = determineSmartHandoff({
      userQuery: rawQuery,
      language: "en",
    });

    const updatedContext = updateContextWithTurn(context, {
      language,
      intent: validationResult.intent,
    });

    const isRejection = validationResult.intent === "UNCLEAR" || validationResult.intent === "OUT_OF_TOPIC";
    const eventSource = isRejection ? "guardrail_rejected" : "deterministic_fallback";

    logChatbotEvent({
      timestamp: new Date().toISOString(),
      source: eventSource,
      language: "en",
      queryLength: rawQuery.length,
      durationMs: Date.now() - startTime,
      handoffAction: handoff.action,
      recommendedCount: 0,
      hasError: false,
    });

    return {
      success: true,
      message: validationResult.responseMessage || CLARIFICATION_FALLBACK_EN,
      suggestedPrompts: validationResult.suggestedPrompts || [
        "View tour packages",
        "How much is Blue Fire tour?",
        "Can you recommend a tour?",
      ],
      handoff,
      context: updatedContext,
      source: eventSource,
    };
  }

  // 5. Fetch Live Data from Supabase / Prisma Database (Retrieval-Augmented Generation)
  // Strictly active packages and FAQs
  const [livePackages, liveDestinations, liveFaqs, upcomingSchedules] = await Promise.all([
    getAllActivePackages(),
    getAllDestinations(),
    getAllActiveFaqs(),
    getUpcomingSchedules(),
  ]);

  // Contextual query resolution (binds "how long is it?" to last referenced package, or "Why?" to prior turn)
  const { resolvedQuery, inferredPackage, isComparisonQuery } = resolveContextualQuery(
    normalizedQuery,
    context,
    livePackages,
    messages
  );

  const relevantKnowledge = searchKnowledgeBase(resolvedQuery);

  // 6. Attempt Generative Response with Gemini AI
  const systemInstruction = buildSystemInstruction("en");
  const promptContext = buildFactualContextPrompt({
    query: resolvedQuery,
    packages: livePackages,
    destinations: liveDestinations,
    faqs: liveFaqs,
    knowledge: relevantKnowledge,
    history: messages.slice(-6),
    language: "en",
  });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      message: {
        type: Type.STRING,
        description: "Comprehensive, structured markdown response answering the user query.",
      },
      recommendedPackageIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exact IDs of tour packages directly recommended to the user.",
      },
      comparisonPackageIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exact IDs of tour packages if the user asked to compare them.",
      },
      handoffAction: {
        type: Type.STRING,
        description: "explore_packages, whatsapp, both, or none",
      },
      suggestedPrompts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2-3 short, relevant follow-up prompts for the customer to click next.",
      },
    },
    required: ["message"],
  };

  const geminiResult = await callGeminiWithFallback({
    systemInstruction,
    prompt: promptContext,
    responseMimeType: "application/json",
    responseSchema,
    temperature: 0.2, // Low temperature for factual precision
  });

  // 7. Handle Gemini Result or Fallback
  if (geminiResult.success && geminiResult.text) {
    try {
      const cleanJson = geminiResult.text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleanJson);

      // Deterministic Grounding & Verification
      const groundedPackages = groundPackageRecommendations(
        parsed.recommendedPackageIds || [],
        livePackages
      );

      const groundedComparisons = groundPackageRecommendations(
        parsed.comparisonPackageIds || [],
        livePackages
      );

      const activePkg =
        groundedPackages[0] ||
        groundedComparisons[0] ||
        inferredPackage ||
        (context.lastReferencedPackageId
          ? livePackages.find((p) => p.id === context.lastReferencedPackageId)
          : undefined);

      // Smart Handoff Decision (strictly in English)
      const handoff = determineSmartHandoff({
        userQuery: rawQuery,
        referencedPackage: activePkg,
        aiSuggestedAction: parsed.handoffAction,
        language: "en",
      });

      const updatedContext = updateContextWithTurn(context, {
        language,
        referencedPackage: activePkg,
        comparisonPackages: groundedComparisons.length >= 2 ? groundedComparisons : undefined,
      });

      logChatbotEvent({
        timestamp: new Date().toISOString(),
        source: "gemini_hybrid",
        modelUsed: geminiResult.modelUsed,
        language: "en",
        queryLength: rawQuery.length,
        durationMs: Date.now() - startTime,
        handoffAction: handoff.action,
        recommendedCount: groundedPackages.length,
        hasError: false,
      });

      return {
        success: true,
        message: parsed.message,
        recommendedPackages: groundedPackages,
        comparisonPackages: groundedComparisons,
        suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts : [],
        handoff,
        context: updatedContext,
        source: "gemini_hybrid",
      };
    } catch (parseError) {
      console.warn("[Hybrid Orchestrator] JSON parse failed, falling back to deterministic engine:", parseError);
    }
  }

  // 8. Graceful Fallback to Deterministic Database Engine
  // Triggered if Gemini encounters API auth errors (e.g. 401 unauthenticated), quota limits (429), or 503 traffic
  const fallbackResult = await executeDeterministicFallback({
    messages,
    context: context as any,
    errorReason: geminiResult.error?.message,
  });

  const activeReferencedPkg =
    fallbackResult.recommendedPackages && fallbackResult.recommendedPackages[0]
      ? livePackages.find((p) => p.id === fallbackResult.recommendedPackages[0].id)
      : inferredPackage;

  const handoff = determineSmartHandoff({
    userQuery: rawQuery,
    referencedPackage: activeReferencedPkg,
    isCustomTrip: Boolean(fallbackResult.customTrip),
    language: "en",
  });

  const updatedContext = updateContextWithTurn(
    {
      ...context,
      lastIntent: fallbackResult.context?.lastIntent,
      lastPackageId: fallbackResult.context?.lastPackageId,
    },
    {
      language,
      referencedPackage: activeReferencedPkg,
      intent: fallbackResult.context?.lastIntent,
    }
  );

  logChatbotEvent({
    timestamp: new Date().toISOString(),
    source: "deterministic_fallback",
    language: "en",
    queryLength: rawQuery.length,
    durationMs: Date.now() - startTime,
    handoffAction: handoff.action,
    recommendedCount: fallbackResult.recommendedPackages?.length || 0,
    hasError: false,
  });

  return {
    success: true,
    message: fallbackResult.message,
    recommendedPackages: fallbackResult.recommendedPackages,
    comparisonPackages: fallbackResult.comparisonPackages,
    customTrip: fallbackResult.customTrip,
    suggestedPrompts: fallbackResult.suggestedPrompts,
    handoff,
    context: updatedContext,
    source: "deterministic_fallback",
  };
}
