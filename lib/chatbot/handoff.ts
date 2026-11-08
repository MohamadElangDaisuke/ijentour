import { getAdminWhatsAppNumber, getWhatsAppLink } from "@/lib/whatsapp";
import { CleanPackageData } from "@/lib/ai/chatbot/tools/packages";

export type HandoffActionType = "explore_packages" | "whatsapp" | "both" | "none";

export interface HandoffDecision {
  action: HandoffActionType;
  packageLink?: string;
  packageTitle?: string;
  whatsAppLink?: string;
  whatsAppPromptText?: string;
}

export interface DetermineHandoffParams {
  userQuery: string;
  intent?: string;
  referencedPackage?: CleanPackageData;
  isCustomTrip?: boolean;
  isOutOfTopic?: boolean;
  isInformationUnavailable?: boolean;
  aiSuggestedAction?: HandoffActionType;
  language: "en" | "id";
}

/**
 * Determines whether to trigger Explore Packages, WhatsApp, or both according to Section 10 rules.
 */
export function determineSmartHandoff(params: DetermineHandoffParams): HandoffDecision {
  const {
    userQuery,
    referencedPackage,
    isCustomTrip,
    isOutOfTopic,
    isInformationUnavailable,
    aiSuggestedAction,
    language,
  } = params;

  if (isOutOfTopic) {
    return { action: "none" };
  }

  const lower = userQuery.toLowerCase();

  // Explicit WhatsApp signals
  const wantsBooking =
    lower.includes("booking") ||
    lower.includes("pesan") ||
    lower.includes("reservasi") ||
    lower.includes("daftar") ||
    lower.includes("book this") ||
    lower.includes("i want to book") ||
    lower.includes("can i book") ||
    lower.includes("can we book") ||
    lower.includes("how to book") ||
    lower === "can i book this tour?" ||
    lower === "can i book this tour";

  const wantsCustom =
    isCustomTrip ||
    lower.includes("custom") ||
    lower.includes("rombongan") ||
    lower.includes("private tour") ||
    lower.includes("corporate") ||
    lower.includes("keluarga besar");

  const wantsAdmin =
    lower.includes("admin") ||
    lower.includes("human") ||
    lower.includes("bicara dengan") ||
    lower.includes("hubungi") ||
    lower.includes("contact") ||
    lower.includes("whatsapp") ||
    lower.includes("wa");

  // Explicit Explore Packages signals
  const exploresPackages =
    lower.includes("harga") ||
    lower.includes("biaya") ||
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("paket apa") ||
    lower.includes("rekomendasi") ||
    lower.includes("recommend") ||
    lower.includes("itinerary") ||
    lower.includes("bandingkan") ||
    lower.includes("compare");

  let action: HandoffActionType = "none";

  if (isInformationUnavailable || wantsAdmin || wantsBooking || wantsCustom) {
    action = exploresPackages ? "both" : "whatsapp";
  } else if (exploresPackages) {
    action = "explore_packages";
  } else if (aiSuggestedAction) {
    action = aiSuggestedAction;
  }

  // Construct links
  const packageLink = referencedPackage
    ? `/packages/${referencedPackage.id}`
    : "/packages";
  const packageTitle = referencedPackage ? referencedPackage.title : undefined;

  let whatsAppMessage = "";
  if (referencedPackage) {
    whatsAppMessage = `Hello Ijen Tour Admin, I would like to inquire about the "${referencedPackage.title}" package (${referencedPackage.price}). Could you please share the schedule availability and reservation details? Thank you!`;
  } else if (wantsCustom) {
    whatsAppMessage = `Hello Ijen Tour Team, I would like to inquire about a custom private tour package for our group. Could you please assist us? Thank you!`;
  } else {
    whatsAppMessage = `Hello Ijen Tour Team, I would like to inquire about Mount Ijen tour packages and travel arrangements. Thank you!`;
  }

  const whatsAppLink = getWhatsAppLink(whatsAppMessage);

  return {
    action,
    packageLink,
    packageTitle,
    whatsAppLink,
    whatsAppPromptText: whatsAppMessage,
  };
}
