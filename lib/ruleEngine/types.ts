import { LivePackage, LiveFaq } from "@/lib/travelAssistant";

export type SupportedLanguage = "en" | "id";

export type ChatbotIntent =
  | "GREETING"
  | "LIST_PACKAGES"
  | "PACKAGE_PRICE"
  | "PACKAGE_DURATION"
  | "PACKAGE_FACILITIES"
  | "PACKAGE_ITINERARY"
  | "PACKAGE_COMPARISON"
  | "PACKAGE_RECOMMENDATION"
  | "DESTINATION_INFO"
  | "CUSTOM_TRIP_INFO"
  | "BOOKING_PROCEDURE"
  | "POLICIES_INFO"
  | "SCHEDULE_AVAILABILITY"
  | "FAQ_QUESTION"
  | "CONTACT_SUPPORT"
  | "AMBIGUOUS_CLARIFICATION"
  | "OUT_OF_SCOPE";

export interface ConversationContext {
  lastPackageId?: string;
  lastPackageName?: string;
  lastIntent?: ChatbotIntent;
  language?: SupportedLanguage;
}

export interface ExtractedEntities {
  packageIds: string[];
  destinationSlugs: string[];
  maxBudget?: number;
  durationDays?: number;
  participants?: number;
  isCustomTrip?: boolean;
  rawKeywords: string[];
}

export interface ChatbotClassificationResult {
  intent: ChatbotIntent;
  confidence: number;
  language: SupportedLanguage;
  entities: ExtractedEntities;
  matchedFaq?: LiveFaq;
  clarificationPrompt?: string;
}

export interface ChatbotResponse {
  success: boolean;
  message: string;
  recommendedPackages?: LivePackage[];
  comparisonPackages?: LivePackage[];
  customTrip?: {
    isCustomTrip: boolean;
    targetUrl: string;
    formattedSummary: string;
  } | null;
  suggestedPrompts?: string[];
  context: ConversationContext;
}
