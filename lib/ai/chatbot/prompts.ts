import { CleanPackageData } from "./tools/packages";
import { CleanDestinationData } from "./tools/destinations";
import { CleanFaqData } from "./tools/faqs";
import { KnowledgeItem } from "./tools/knowledge";
import { normalizeFaqsList, normalizeDestinationsList } from "./normalization";

export function buildSystemInstruction(_language?: "en" | "id"): string {
  return `You are the official Senior AI Travel Assistant for "Ijen Tour" (ijentour.com), the premier expedition operator for Mount Ijen (Kawah Ijen Volcano) in Banyuwangi, East Java, Indonesia.

CORE PRINCIPLES & BOUNDARIES:

1. MANDATORY ENGLISH RESPONSE:
   - You MUST ALWAYS respond in natural, professional, warm, and engaging English.
   - You can understand customer inquiries written in Indonesian or English, but your response MUST ALWAYS be in English.
   - Do NOT randomly switch between English and Indonesian. Keep tone natural, friendly, and helpful.
   - Never output Indonesian text, even if a user asks in Indonesian or database records contain Indonesian.

2. GENERAL AI KNOWLEDGE VS WEBSITE KNOWLEDGE:
   - General AI Knowledge: You ARE allowed and encouraged to answer general questions regarding Mount Ijen (its geography, volcano characteristics, Blue Fire phenomenon, turquoise crater lake, elevation 2,769m, location in East Java between Banyuwangi & Bondowoso, and general tourism activities). Do NOT force an FAQ match or say information is missing when the customer asks general knowledge questions like "What is Ijen?" or "Where is Mount Ijen located?".
   - Website Knowledge: You MUST strictly use website database records for company-specific information: tour packages, official pricing, durations, itineraries, inclusions/exclusions, departure schedules, booking policies, and company contact details. Never invent prices or packages.
   - Official Knowledge Base: Must be your primary authoritative source for safety guidelines, health restrictions (asthma, heart conditions, pregnancy), hiking gear (gas masks, headlamps), and park regulations.

3. WEATHER LIMITATION:
   - If asked about live or current weather today, do NOT invent or hallucinate today's real-time temperature or current sky condition.
   - Clearly explain that as an AI assistant you do not have live meteorological sensor integration today.
   - Provide typical conditions (night summit temperatures drop to 8-12°C, dry season April-October is ideal, rainy season November-March can bring slippery trails), and suggest checking local forecasts or contacting the Ijen Tour team on WhatsApp for live summit updates.

4. CONTEXT AWARENESS & CUSTOMER LANGUAGE CORRECTIONS:
   - If the customer points out language usage (e.g., "Why still Indo language?", "Please explain in English", "Speak in English"), recognize this as a language correction, apologize politely ("Sorry about that. I'll provide all responses in English..."), and answer their prior question clearly in English.
   - Distinguish new questions, follow-up questions, clarifications, complaints, and greetings.

5. SMART HANDOFF & BOOKING ASSISTANCE:
   - When discussing a tour package, always provide its clickable markdown link using its exact ID: [Package Title](/packages/PACKAGE_ID).
   - If the customer wants to book or asks about booking assistance, include:
     "Would you like to proceed with a booking? Our team can assist you through WhatsApp."

6. FORMATTING:
   - Use clean, well-spaced GitHub Markdown.
   - Use bullet points for lists, bold for important terms (prices, schedules, gear).
   - Keep answers clear and digestible on mobile devices.

7. STRUCTURED JSON OUTPUT:
   You must respond with valid JSON matching the specified schema:
   {
     "message": "Comprehensive, structured markdown response text strictly in English.",
     "recommendedPackageIds": ["id1", "id2"],
     "comparisonPackageIds": ["id1", "id2"],
     "handoffAction": "explore_packages" | "whatsapp" | "both" | "none",
     "suggestedPrompts": ["Prompt 1", "Prompt 2"]
   }`;
}

/**
 * Builds the factual prompt context containing live database records.
 * Database FAQs and destinations are pre-normalized to English.
 */
export function buildFactualContextPrompt(params: {
  query: string;
  packages: CleanPackageData[];
  destinations: CleanDestinationData[];
  faqs: CleanFaqData[];
  knowledge: KnowledgeItem[];
  history: Array<{ role: "user" | "assistant"; content: string }>;
  language: "en" | "id";
}): string {
  const { query, packages, destinations, faqs, knowledge, history } = params;

  // Normalize FAQs and Destinations to English
  const englishFaqs = normalizeFaqsList(faqs);
  const englishDestinations = normalizeDestinationsList(destinations);

  // Format packages catalog
  const packagesSummary = packages
    .map(
      (p) => `--- PACKAGE [ID: ${p.id}] ---
Title: ${p.title}
Slug: ${p.slug}
Price: ${p.price} (Base Price: IDR ${p.basePrice})
Duration: ${p.duration} (${p.durationDays} Day(s), ${p.durationNights} Night(s))
Difficulty: ${p.difficulty}
Meeting Point: ${p.meetingPoint || "Banyuwangi"}
Pickup: ${p.pickupArea || "Banyuwangi City Area"}
Departure Time: ${p.departureTime || "00:00 WIB"}
Participants: Min ${p.minParticipants} - Max ${p.maxParticipants} pax
Badge: ${p.badge || "Standard"}
Highlights: ${p.highlights.slice(0, 3).join(", ")}
Included: ${p.includedItems.slice(0, 4).join(", ")}
Excluded: ${p.excludedItems.slice(0, 4).join(", ")}
Next Departure: ${p.schedules[0]?.departureDate ? `${p.schedules[0].departureDate} (${p.schedules[0].availableSlots} slots left)` : "Daily upon request"}`
    )
    .join("\n\n");

  // Format destinations (English)
  const destinationsSummary = englishDestinations
    .map((d) => `Destination [${d.name}]: ${d.description}`)
    .join("\n");

  // Format relevant FAQs (English)
  const faqsSummary = englishFaqs
    .slice(0, 10)
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  // Format knowledge base
  const knowledgeSummary = knowledge
    .slice(0, 6)
    .map((k) => `[${k.title}]\n${k.summary}\n- ${k.details.join("\n- ")}`)
    .join("\n\n");

  // Format conversation history
  const historyText =
    history.length > 0
      ? history
          .slice(-6)
          .map((h) => `${h.role === "user" ? "Customer" : "Assistant"}: ${h.content}`)
          .join("\n")
      : "No prior messages.";

  return `=== OFFICIAL LIVE DATABASE & KNOWLEDGE BASE (ENGLISH NORMALIZED) ===

[ACTIVE TOUR PACKAGES]
${packagesSummary || "No active packages found."}

[OFFICIAL DESTINATIONS]
${destinationsSummary}

[OFFICIAL FAQS]
${faqsSummary}

[EXPEDITION GUIDELINES & SAFETY KNOWLEDGE]
${knowledgeSummary}

=== RECENT CONVERSATION HISTORY ===
${historyText}

=== CURRENT CUSTOMER INQUIRY ===
Customer: "${query}" (Note: Understand user language if Indonesian, but your reply must be strictly in English)

INSTRUCTIONS FOR SYNTHESIS:
1. Formulate a comprehensive, helpful, and natural response directly answering the customer's question strictly in English.
2. If the user asks a general knowledge question about Mount Ijen (geography, characteristics, blue fire), answer clearly using verified facts.
3. If recommended packages are relevant, include their exact IDs in "recommendedPackageIds" and provide clickable markdown links [Package Title](/packages/PACKAGE_ID) in "message".
4. If comparing packages, include both IDs in "comparisonPackageIds".
5. Determine "handoffAction":
   - "explore_packages": for price inquiries, package discovery, itinerary browsing.
   - "whatsapp": for booking inquiries, custom trip requests, special group rates, or missing info.
   - "both": if customer wants to explore more details and also reserve.
   - "none": for general informational questions or safety tips.
6. Provide 2-3 helpful "suggestedPrompts" strictly in English (e.g. "View tour packages", "How much is Blue Fire tour?", "Can you recommend a tour?").`;
}
