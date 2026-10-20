import "dotenv/config";
import { NextResponse } from "next/server";
import { processChatbotMessage } from "@/lib/ruleEngine/engine";
import { ConversationContext } from "@/lib/ruleEngine/types";

export const runtime = "nodejs";

// Simple in-memory sliding window rate limiter (25 requests / minute / IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 25;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TravelAssistantRequest {
  messages: ChatMessage[];
  context?: ConversationContext;
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "guest-client";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit reached. Please wait a moment before sending another message.",
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Body
    let body: TravelAssistantRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { messages = [], context = {} } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array cannot be empty." },
        { status: 400 }
      );
    }

    // Sanitize conversation history to prevent ballooning payload
    const sanitizedMessages = messages.slice(-10).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content || "").slice(0, 1000).trim(),
    }));

    const lastUserMsg = sanitizedMessages
      .slice()
      .reverse()
      .find((m) => m.role === "user");

    if (!lastUserMsg || !lastUserMsg.content) {
      return NextResponse.json(
        { success: false, error: "No user question found." },
        { status: 400 }
      );
    }

    // 3. Process via Strictly Rule-Based Engine (NO generative AI, 100% DB-driven)
    const result = await processChatbotMessage({
      messages: sanitizedMessages,
      context,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      recommendedPackages: result.recommendedPackages || [],
      comparisonPackages: result.comparisonPackages || [],
      customTrip: result.customTrip || null,
      suggestedPrompts: result.suggestedPrompts || [],
      context: result.context,
      source: "rule_based_database",
    });
  } catch (error: any) {
    console.error("[Rule-Based Chatbot] Error processing message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your inquiry.",
      },
      { status: 500 }
    );
  }
}
