import { SupportedLanguage } from "./types";

export interface ValidationResult {
  isValid: boolean;
  cleanText: string;
  errorMessage?: string;
}

const MAX_INPUT_LENGTH = 1000;

/**
 * Validate customer input string
 */
export function validateInput(rawInput: unknown): ValidationResult {
  if (typeof rawInput !== "string") {
    return {
      isValid: false,
      cleanText: "",
      errorMessage: "Input must be a valid text string.",
    };
  }

  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      cleanText: "",
      errorMessage: "Question cannot be empty. Please ask something about our tours.",
    };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return {
      isValid: false,
      cleanText: trimmed.slice(0, MAX_INPUT_LENGTH),
      errorMessage: `Question is too long (maximum ${MAX_INPUT_LENGTH} characters). Please shorten your inquiry.`,
    };
  }

  // Sanitize control characters except common newlines
  const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return {
    isValid: true,
    cleanText: sanitized,
  };
}

/**
 * Normalizes text for keyword and intent matching
 */
export function normalizeText(text: string): string {
  let normalized = text
    .toLowerCase()
    .replace(/[^\w\s\.,?!\-\/]/g, " ") // keep basic punctuation
    .replace(/\s+/g, " ")
    .trim();

  // Normalize common colloquial abbreviations
  const slangReplacements: Array<[RegExp, string]> = [
    [/\bbrp\b/g, "berapa"],
    [/\bhrg\b/g, "harga"],
    [/\bpkt\b/g, "paket"],
    [/\brekom\b/g, "rekomendasi"],
    [/\brecom\b/g, "recommend"],
    [/\brecommendation\b/g, "recommend"],
    [/\bgmn\b/g, "bagaimana"],
    [/\bdmn\b/g, "dimana"],
    [/\bkpn\b/g, "kapan"],
    [/\butk\b/g, "untuk"],
    [/\bsy\b/g, "saya"],
    [/\bkm\b/g, "kami"],
    [/\bhub\b/g, "hubungi"],
    [/\bwa\b/g, "whatsapp"],
    [/\bdest\b/g, "destinasi"],
    [/\bfas\b/g, "fasilitas"],
    [/\binc\b/g, "include"],
    [/\bexc\b/g, "exclude"],
  ];

  for (const [regex, replacement] of slangReplacements) {
    normalized = normalized.replace(regex, replacement);
  }

  return normalized;
}

/**
 * Detect language between Indonesian ('id') and English ('en')
 */
export function detectLanguage(text: string, previousLang?: SupportedLanguage): SupportedLanguage {
  const lower = text.toLowerCase();

  const idTokens = [
    "berapa", "harga", "biaya", "paket", "wisata", "kapan", "bagaimana", "apakah",
    "apa", "bisa", "jadwal", "fasilitas", "termasuk", "tidak", "murah", "rekomendasi",
    "destinasi", "anak", "orang", "pesan", "booking", "hubungi", "kontak", "admin",
    "bawa", "perlengkapan", "aman", "gunung", "kawah", "api", "biru", "durasi", "hari",
    "malam", "pembayaran", "batal", "refund", "keberangkatan", "tanya", "halo", "selamat",
  ];

  const enTokens = [
    "how", "much", "cost", "price", "tour", "package", "when", "what", "where",
    "which", "can", "schedule", "facility", "facilities", "include", "included",
    "exclude", "excluded", "cheap", "budget", "recommend", "recommendation",
    "destination", "child", "children", "kid", "kids", "person", "people", "book",
    "booking", "contact", "admin", "bring", "gear", "safe", "safety", "mountain",
    "crater", "blue", "fire", "duration", "day", "night", "payment", "cancel",
    "cancellation", "refund", "departure", "hello", "hi", "good",
  ];

  let idScore = 0;
  let enScore = 0;

  const words = lower.split(/\s+/);
  for (const w of words) {
    const cleanW = w.replace(/[.,?!]/g, "");
    if (idTokens.includes(cleanW)) idScore++;
    if (enTokens.includes(cleanW)) enScore++;
  }

  if (idScore > enScore) return "id";
  if (enScore > idScore) return "en";

  return previousLang || "en";
}
