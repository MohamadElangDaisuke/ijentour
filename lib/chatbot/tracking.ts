/**
 * Safe, privacy-preserving tracking & logging for Hybrid AI Chatbot.
 * Strips PII (emails, phone numbers, passwords) from logs.
 */

export interface ChatbotLogEntry {
  timestamp: string;
  source: "gemini_hybrid" | "deterministic_fallback" | "guardrail_rejected";
  modelUsed?: string;
  language: "en" | "id";
  queryLength: number;
  durationMs: number;
  handoffAction?: string;
  recommendedCount: number;
  hasError: boolean;
}

export function logChatbotEvent(entry: ChatbotLogEntry) {
  // Safe sanitized development/server logging
  if (process.env.NODE_ENV !== "test") {
    console.log(
      `[Chatbot Event] ${entry.timestamp} | source=${entry.source} | lang=${entry.language} | duration=${entry.durationMs}ms | handoff=${entry.handoffAction || "none"} | error=${entry.hasError}`
    );
  }
}
