/**
 * Optional Gemini text enhancement for the Interactive Menu Chatbot
 * Only called for overview/description answers – NOT for prices, itineraries, or policies.
 * Gracefully falls back to raw text if Gemini is unavailable.
 */

import { callGeminiWithFallback } from "@/lib/ai/gemini";

const SYSTEM_INSTRUCTION =
  "You are a travel content writer for Ijen Tour. Enhance the following text to be more engaging in natural English. Keep all factual information exactly as provided. Max 150 words.";

/**
 * Enhance a raw description string using Gemini.
 * Returns rawText unchanged if Gemini fails or is not configured.
 *
 * @param rawText   - The original text to enhance
 * @param context   - Brief label for the content (e.g. "Mount Ijen overview")
 */
export async function enhanceDescription(
  rawText: string,
  context: string
): Promise<string> {
  if (!rawText || rawText.trim().length === 0) return rawText;

  try {
    const result = await callGeminiWithFallback({
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: `Context: ${context}\n\nText to enhance:\n${rawText}`,
      temperature: 0.6,
      maxOutputTokens: 300,
    });

    if (result.success && result.text && result.text.trim().length > 0) {
      return result.text.trim();
    }

    // Gemini returned empty or failed – fall back silently
    return rawText;
  } catch {
    // Any unexpected error: return original text unchanged
    return rawText;
  }
}
