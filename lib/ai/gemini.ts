import { GoogleGenAI } from "@google/genai";

export const GEMINI_FALLBACK_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-pro-latest",
];

export interface ExtractedGeminiError {
  code: number;
  status: string;
  message: string;
  isRetryable: boolean;
}

export function parseGeminiError(err: any): ExtractedGeminiError {
  let code = 500;
  let status = "INTERNAL";
  let message = "";

  if (typeof err === "string") {
    message = err;
  } else if (err) {
    message = err.message || "";

    if (err.error) {
      if (typeof err.error.code === "number") code = err.error.code;
      if (typeof err.error.status === "string") status = err.error.status;
      if (typeof err.error.message === "string" && !message) message = err.error.message;
    }

    if (typeof err.status === "number") {
      code = err.status;
    } else if (typeof err.status === "string") {
      status = err.status;
    }

    if (typeof err.code === "number") {
      code = err.code;
    }
  }

  if (message && message.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(message);
      if (parsed.error) {
        if (parsed.error.code) code = Number(parsed.error.code);
        if (parsed.error.status) status = parsed.error.status;
        if (parsed.error.message) message = parsed.error.message;
      }
    } catch {
      // keep original
    }
  }

  const combined = (message + " " + status).toUpperCase();

  if (
    code === 503 ||
    status === "UNAVAILABLE" ||
    combined.includes("503") ||
    combined.includes("UNAVAILABLE") ||
    combined.includes("HIGH DEMAND") ||
    combined.includes("OVERLOADED")
  ) {
    code = 503;
    status = "UNAVAILABLE";
  } else if (
    code === 429 ||
    status === "RESOURCE_EXHAUSTED" ||
    combined.includes("429") ||
    combined.includes("RESOURCE_EXHAUSTED") ||
    combined.includes("QUOTA") ||
    combined.includes("RATE LIMIT")
  ) {
    code = 429;
    status = "RESOURCE_EXHAUSTED";
  } else if (
    code === 401 ||
    code === 403 ||
    status === "PERMISSION_DENIED" ||
    status === "UNAUTHENTICATED" ||
    combined.includes("API_KEY_INVALID") ||
    combined.includes("API KEY NOT VALID") ||
    combined.includes("PERMISSION_DENIED") ||
    combined.includes("UNAUTHENTICATED") ||
    combined.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED")
  ) {
    code = code === 403 ? 403 : 401;
    status = "UNAUTHENTICATED";
  } else if (
    code === 400 ||
    status === "INVALID_ARGUMENT" ||
    combined.includes("INVALID_ARGUMENT") ||
    combined.includes("SAFETY") ||
    combined.includes("BLOCKED")
  ) {
    code = 400;
    status = "INVALID_ARGUMENT";
  }

  const isRetryable = code === 503 || code === 429;
  return { code, status, message, isRetryable };
}

export interface CallGeminiOptions {
  systemInstruction?: string;
  prompt: string;
  responseMimeType?: "text/plain" | "application/json";
  responseSchema?: any;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface CallGeminiResult {
  success: boolean;
  text?: string;
  modelUsed?: string;
  error?: ExtractedGeminiError;
}

/**
 * Executes a Gemini request with automatic fallback through the priority model chain.
 * Reuses the server's GEMINI_API_KEY environment variable.
 */
export async function callGeminiWithFallback(
  options: CallGeminiOptions
): Promise<CallGeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return {
      success: false,
      error: {
        code: 401,
        status: "UNAUTHENTICATED",
        message: "GEMINI_API_KEY is not configured.",
        isRetryable: false,
      },
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const errorsHistory: ExtractedGeminiError[] = [];

  for (let i = 0; i < GEMINI_FALLBACK_MODELS.length; i++) {
    const modelName = GEMINI_FALLBACK_MODELS[i];
    try {
      const config: any = {};
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      if (options.responseSchema) {
        config.responseSchema = options.responseSchema;
      }
      if (typeof options.temperature === "number") {
        config.temperature = options.temperature;
      }
      if (typeof options.maxOutputTokens === "number") {
        config.maxOutputTokens = options.maxOutputTokens;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.prompt,
        config,
      });

      if (response && response.text) {
        return {
          success: true,
          text: response.text,
          modelUsed: modelName,
        };
      }
    } catch (err: any) {
      const parsed = parseGeminiError(err);
      errorsHistory.push(parsed);

      // Fatal errors: authentication failures shouldn't spam every model
      if (parsed.code === 401 || parsed.code === 403) {
        return {
          success: false,
          error: parsed,
        };
      }

      if (parsed.code === 400 && !parsed.isRetryable) {
        return {
          success: false,
          error: parsed,
        };
      }
    }
  }

  const lastErr = errorsHistory[errorsHistory.length - 1] || {
    code: 500,
    status: "INTERNAL",
    message: "All fallback Gemini models failed.",
    isRetryable: false,
  };

  return {
    success: false,
    error: lastErr,
  };
}
