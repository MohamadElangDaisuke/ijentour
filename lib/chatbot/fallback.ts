import { processChatbotMessage } from "@/lib/ruleEngine/engine";
import { ConversationContext } from "@/lib/ruleEngine/types";

export interface FallbackOptions {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  context?: ConversationContext;
  errorReason?: string;
}

/**
 * Graceful fallback to deterministic rule engine when Gemini is unavailable,
 * overloaded (503/429), or encountering network/quota issues.
 */
export async function executeDeterministicFallback(options: FallbackOptions) {
  try {
    const result = await processChatbotMessage({
      messages: options.messages,
      context: options.context,
    });

    return {
      success: true,
      message: result.message,
      recommendedPackages: result.recommendedPackages || [],
      comparisonPackages: result.comparisonPackages || [],
      customTrip: result.customTrip || null,
      suggestedPrompts: result.suggestedPrompts || [],
      context: result.context,
      source: "deterministic_database_fallback",
    };
  } catch (err: any) {
    console.error("[Chatbot Fallback] Deterministic engine error:", err);
    return {
      success: false,
      message:
        "We are temporarily having trouble connecting to the assistant. Please contact our team directly via WhatsApp for immediate support.",
      recommendedPackages: [],
      comparisonPackages: [],
      customTrip: null,
      suggestedPrompts: ["Contact on WhatsApp", "View Tour Packages"],
      context: options.context,
      source: "error_fallback",
    };
  }
}
