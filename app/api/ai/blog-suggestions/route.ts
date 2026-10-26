import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "nodejs";

export type SuggestionType =
  | "topics"
  | "categories"
  | "focus"
  | "audiences"
  | "purposes"
  | "primaryKeywords"
  | "secondaryKeywords";

export interface BlogSuggestionRequest {
  type: SuggestionType;
  context?: {
    topic?: string;
    category?: string;
    focus?: string;
    targetAudience?: string | string[];
    purpose?: string;
    writingStyle?: string;
    primaryKeyword?: string;
    existingCategories?: string[];
  };
}

const FALLBACK_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-pro-latest",
];

const SYSTEM_CATEGORIES = [
  "Guide",
  "Tips & Tricks",
  "Ijen Geology & Nature",
  "Local Culture",
  "Destinations",
  "Culinary",
];

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY configuration was not found on the server.",
        },
        { status: 500 }
      );
    }

    let body: BlogSuggestionRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const { type, context = {} } = body;
    const {
      topic = "",
      category = "",
      focus = "",
      targetAudience = "",
      purpose = "",
      primaryKeyword = "",
    } = context;

    const audienceStr = Array.isArray(targetAudience)
      ? targetAudience.join(", ")
      : targetAudience;

    let instruction = "";
    let userPrompt = "";

    switch (type) {
      case "topics":
        instruction = `You are an expert travel editor and SEO strategist for Mount Ijen Tour (mountijentour.com) in East Java, Indonesia.
Mount Ijen is famous for its midnight hike, world-renowned electric Blue Fire, turquoise acid crater lake, traditional sulfur miners, and sunrise.
Your goal is to suggest 5 to 6 compelling, high-CTR, SEO-optimized article topics / titles in English.
- If the user provides a topic or keyword, suggest creative, engaging variations and angles around that theme.
- If the user provides no topic or a general phrase, suggest top-trending Mount Ijen expedition topics (hiking guides, blue fire safety, travel from Bali/Surabaya, packing lists, best season, etc.).
- Titles should be clear, enticing, and professional. Avoid clickbait.`;
        userPrompt = topic.trim()
          ? `User seed topic/keyword: "${topic.trim()}". Suggest 5 to 6 specific, captivating article topic titles in English expanding or refining this topic.`
          : `Suggest 5 to 6 popular, highly engaging article topic titles in English for an expedition tour blog about Mount Ijen (Kawah Ijen Volcano).`;
        break;

      case "categories":
        instruction = `You are a content organizer for Ijen Tour.
The blog has standard primary categories: ${SYSTEM_CATEGORIES.join(", ")}.
Based on the article topic and focus, suggest 4 to 5 most relevant categories in English.
Strictly prioritize matching one or more of the existing categories (${SYSTEM_CATEGORIES.join(", ")}) or highly relevant travel niche categories (e.g. "Safety", "Transportation", "Photography").`;
        userPrompt = `Topic: "${topic || "Mount Ijen Tour"}"
${focus ? `Focus/Angle: "${focus}"` : ""}
Suggest 4 to 5 relevant category names for this blog article.`;
        break;

      case "focus":
        instruction = `You are a travel content planner for Ijen Tour.
Suggest 4 to 5 clear, actionable angles / focal points for the given article topic in English.
Examples of angles:
- For first-time international travelers who have never hiked a volcano
- Focus on the best timing and vantage points to view the Blue Fire
- Safety-first guide on gas masks and mitigating sulfur smoke exposure
- Transit logistics and ferry crossing guide from Bali to Banyuwangi
- Night photography and sunrise capture tips at the crater rim`;
        userPrompt = `Topic: "${topic || "Mount Ijen Expedition"}"
${category ? `Category: "${category}"` : ""}
Suggest 4 to 5 distinct article focus angles in English (concise 1-sentence options).`;
        break;

      case "audiences":
        instruction = `You are an audience targeting specialist for Ijen Tour.
Suggest 4 to 6 relevant target audience segments for this travel article in English.
Examples: International Travelers, First-Time Visitors, Beginner Hikers, Adventure Seekers, Solo Travelers, Photography Enthusiasts, Backpackers, Family Travelers, Couples.`;
        userPrompt = `Topic: "${topic || "Mount Ijen Volcano Tour"}"
${focus ? `Focus: "${focus}"` : ""}
${category ? `Category: "${category}"` : ""}
Suggest 5 to 6 target audiences most interested in this article.`;
        break;

      case "purposes":
        instruction = `You are a content strategist for Ijen Tour.
Suggest 4 to 5 clear article purposes/goals suitable for the article topic and focus in English.
Examples: Travel Guide, Safety Guide, How-To Guide, Packing & Gear Guide, Transportation Guide, Destination Overview, Booking-Oriented Conversion.`;
        userPrompt = `Topic: "${topic || "Mount Ijen Volcano Tour"}"
${focus ? `Focus: "${focus}"` : ""}
Suggest 4 to 5 specific article purposes/types.`;
        break;

      case "primaryKeywords":
        instruction = `You are an SEO specialist for Ijen Tour.
Suggest 4 to 5 high-intent primary SEO keywords (search queries with strong search intent) for this travel article in English.
Ensure keywords feel organic and directly match how real travelers search on Google. No keyword stuffing.`;
        userPrompt = `Topic: "${topic || "Mount Ijen"}"
${focus ? `Focus: "${focus}"` : ""}
${category ? `Category: "${category}"` : ""}
${audienceStr ? `Audience: "${audienceStr}"` : ""}
${purpose ? `Purpose: "${purpose}"` : ""}
Suggest 4 to 5 high-value primary SEO keywords.`;
        break;

      case "secondaryKeywords":
        instruction = `You are an SEO specialist for Ijen Tour.
Suggest 6 to 8 secondary/LSI keywords and semantic tags for this article topic in English.
These should support the primary keyword naturally (e.g. landmarks, equipment, locations, related terms).`;
        userPrompt = `Topic: "${topic || "Mount Ijen"}"
${primaryKeyword ? `Primary Keyword: "${primaryKeyword}"` : ""}
${focus ? `Focus: "${focus}"` : ""}
${category ? `Category: "${category}"` : ""}
Suggest 6 to 8 secondary keywords and LSI phrases.`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Suggestion type "${type}" is not supported.` },
          { status: 400 }
        );
    }

    const ai = new GoogleGenAI({ apiKey });

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        suggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of recommended suggestions for the requested type",
        },
      },
      required: ["suggestions"],
    };

    let rawText = "";

    for (const modelName of FALLBACK_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: instruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (response && response.text) {
          rawText = response.text;
          break;
        }
      } catch {
        console.warn(`[Blog Suggestions] Model ${modelName} failed, trying next fallback...`);
      }
    }

    if (!rawText) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to generate suggestions. Please try again.",
        },
        { status: 503 }
      );
    }

    try {
      const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleanJson);
      const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((s: any) => typeof s === "string" && s.trim().length > 0)
        : [];

      return NextResponse.json({
        success: true,
        type,
        suggestions,
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to generate suggestions. Please try again.",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[Blog Suggestions Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to generate suggestions. Please try again.",
      },
      { status: 500 }
    );
  }
}
