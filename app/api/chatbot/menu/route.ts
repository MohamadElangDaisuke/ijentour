/**
 * POST /api/chatbot/menu
 * Interactive Menu Chatbot – server-side API endpoint
 *
 * Rate limit: 60 requests per minute per IP (sliding window)
 * Validation: action, categoryId, itemId, subAction are strictly checked
 * Errors: Prisma errors are never exposed to the client
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildMainMenuResponse,
  buildCategorySubmenuResponse,
  buildItemListResponse,
  buildItemDetailResponse,
  buildFaqAnswerResponse,
  buildWhatsAppResponse,
} from "@/lib/menuChatbot/responseBuilder";
import type {
  MenuAction,
  CategoryId,
  MenuChatbotRequest,
  MenuChatbotResponse,
} from "@/lib/menuChatbot/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Rate limiter ─────────────────────────────────────────────────────────────

interface RateEntry {
  count: number;
  windowStart: number;
}

const RATE_MAP = new Map<string, RateEntry>();
const RATE_LIMIT = 60;          // max requests per window
const RATE_WINDOW_MS = 60_000;  // 1 minute sliding window

/** Returns true when the request should be allowed, false when rate-limited. */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_MAP.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    RATE_MAP.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
}

// Periodically clean up expired entries to avoid memory growth
let lastCleanup = Date.now();
function maybeCleanupRateMap() {
  const now = Date.now();
  if (now - lastCleanup < RATE_WINDOW_MS * 2) return;
  lastCleanup = now;
  for (const [key, entry] of RATE_MAP.entries()) {
    if (now - entry.windowStart > RATE_WINDOW_MS) {
      RATE_MAP.delete(key);
    }
  }
}

// ─── Validation constants ─────────────────────────────────────────────────────

const VALID_ACTIONS: MenuAction[] = [
  "MAIN_MENU",
  "CATEGORY",
  "ITEM_LIST",
  "ITEM_DETAIL",
  "FAQ_ANSWER",
  "WHATSAPP_HANDOFF",
];

const VALID_CATEGORY_IDS: CategoryId[] = [
  "destinations",
  "packages",
  "prices",
  "booking",
  "transport",
  "safety",
  "weather",
  "about",
  "support",
];

const ITEM_ID_PATTERN = /^[a-z0-9_\-]{1,100}$/i;
const SUB_ACTION_PATTERN = /^[a-z_]{1,50}$/;

// Known request fields – reject unknown keys
const ALLOWED_FIELDS = new Set(["action", "categoryId", "itemId", "subAction", "context"]);
const ALLOWED_CONTEXT_FIELDS = new Set([
  "selectedPackageTitle",
  "selectedDestinationName",
  "categoryId",
]);

// ─── Validation ───────────────────────────────────────────────────────────────

function validateRequest(body: unknown): {
  valid: boolean;
  error?: string;
  parsed?: MenuChatbotRequest;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const obj = body as Record<string, unknown>;

  // Reject unknown top-level fields
  for (const key of Object.keys(obj)) {
    if (!ALLOWED_FIELDS.has(key)) {
      return { valid: false, error: `Unknown field: "${key}"` };
    }
  }

  // action (required)
  if (!obj.action || typeof obj.action !== "string") {
    return { valid: false, error: '"action" is required and must be a string.' };
  }
  if (!(VALID_ACTIONS as string[]).includes(obj.action)) {
    return {
      valid: false,
      error: `Invalid action "${obj.action}". Must be one of: ${VALID_ACTIONS.join(", ")}`,
    };
  }

  // categoryId (optional)
  if (obj.categoryId !== undefined) {
    if (typeof obj.categoryId !== "string") {
      return { valid: false, error: '"categoryId" must be a string.' };
    }
    if (!(VALID_CATEGORY_IDS as string[]).includes(obj.categoryId)) {
      return {
        valid: false,
        error: `Invalid categoryId "${obj.categoryId}". Must be one of: ${VALID_CATEGORY_IDS.join(", ")}`,
      };
    }
  }

  // itemId (optional)
  if (obj.itemId !== undefined) {
    if (typeof obj.itemId !== "string" || !ITEM_ID_PATTERN.test(obj.itemId)) {
      return {
        valid: false,
        error: '"itemId" must be an alphanumeric slug or cuid (max 100 chars).',
      };
    }
  }

  // subAction (optional)
  if (obj.subAction !== undefined) {
    if (typeof obj.subAction !== "string" || !SUB_ACTION_PATTERN.test(obj.subAction)) {
      return {
        valid: false,
        error: '"subAction" must contain only lowercase letters and underscores (max 50 chars).',
      };
    }
  }

  // context (optional object)
  if (obj.context !== undefined) {
    if (typeof obj.context !== "object" || Array.isArray(obj.context) || obj.context === null) {
      return { valid: false, error: '"context" must be an object.' };
    }
    const ctx = obj.context as Record<string, unknown>;
    for (const key of Object.keys(ctx)) {
      if (!ALLOWED_CONTEXT_FIELDS.has(key)) {
        return { valid: false, error: `Unknown context field: "${key}"` };
      }
    }
    if (ctx.selectedPackageTitle !== undefined && typeof ctx.selectedPackageTitle !== "string") {
      return { valid: false, error: '"context.selectedPackageTitle" must be a string.' };
    }
    if (
      ctx.selectedDestinationName !== undefined &&
      typeof ctx.selectedDestinationName !== "string"
    ) {
      return { valid: false, error: '"context.selectedDestinationName" must be a string.' };
    }
    if (
      ctx.categoryId !== undefined &&
      !(VALID_CATEGORY_IDS as string[]).includes(ctx.categoryId as string)
    ) {
      return { valid: false, error: `Invalid context.categoryId: "${ctx.categoryId}"` };
    }
  }

  return {
    valid: true,
    parsed: obj as unknown as MenuChatbotRequest,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  maybeCleanupRateMap();

  // Extract client IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Rate limit check
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please slow down and try again in a minute.",
      },
      { status: 429 }
    );
  }

  // Parse JSON body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // Validate request
  const validation = validateRequest(rawBody);
  if (!validation.valid || !validation.parsed) {
    return NextResponse.json(
      { success: false, error: validation.error ?? "Invalid request." },
      { status: 400 }
    );
  }

  const req = validation.parsed;

  // Route to the appropriate response builder
  let data: MenuChatbotResponse;
  try {
    switch (req.action) {
      case "MAIN_MENU": {
        data = buildMainMenuResponse();
        break;
      }

      case "CATEGORY": {
        if (!req.categoryId) {
          return NextResponse.json(
            { success: false, error: '"categoryId" is required for CATEGORY action.' },
            { status: 400 }
          );
        }
        data = buildCategorySubmenuResponse(req.categoryId);
        break;
      }

      case "ITEM_LIST": {
        if (!req.categoryId) {
          return NextResponse.json(
            { success: false, error: '"categoryId" is required for ITEM_LIST action.' },
            { status: 400 }
          );
        }
        data = await buildItemListResponse(req.categoryId, req.subAction);
        break;
      }

      case "ITEM_DETAIL": {
        if (!req.categoryId) {
          return NextResponse.json(
            { success: false, error: '"categoryId" is required for ITEM_DETAIL action.' },
            { status: 400 }
          );
        }
        if (!req.itemId) {
          return NextResponse.json(
            { success: false, error: '"itemId" is required for ITEM_DETAIL action.' },
            { status: 400 }
          );
        }
        data = await buildItemDetailResponse(
          req.categoryId,
          req.itemId,
          req.subAction,
          req.context
        );
        break;
      }

      case "FAQ_ANSWER": {
        if (!req.subAction) {
          return NextResponse.json(
            { success: false, error: '"subAction" is required for FAQ_ANSWER action.' },
            { status: 400 }
          );
        }
        data = await buildFaqAnswerResponse(req.subAction, req.context);
        break;
      }

      case "WHATSAPP_HANDOFF": {
        data = buildWhatsAppResponse(req.context, req.subAction);
        break;
      }

      default: {
        return NextResponse.json(
          { success: false, error: "Unrecognised action." },
          { status: 400 }
        );
      }
    }
  } catch (err: unknown) {
    // Log the real error server-side but never expose Prisma/internal details to clients
    console.error("[/api/chatbot/menu] Internal error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          "An internal error occurred. Please try again or contact support via WhatsApp.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data }, { status: 200 });
}
