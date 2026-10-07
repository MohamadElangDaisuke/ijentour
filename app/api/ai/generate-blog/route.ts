import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "nodejs";

// Simple in-memory sliding window rate limiter (10 requests / minute / IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 generate requests per minute per IP

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

export interface GenerateBlogRequest {
  topic: string;
  category?: string;
  focus?: string;
  targetAudience?: string | string[];
  purpose?: string;
  writingStyle?: "Travel Blog" | "Informative" | "Promotional" | "Storytelling";
  articleLength?: "500 words" | "800 words" | "1200 words" | "1500 words" | "Short" | "Medium" | "Long" | "Comprehensive";
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  seoOptions?: {
    generateTitle?: boolean;
    generateMetaDescription?: boolean;
    generateSlug?: boolean;
    generateKeywords?: boolean;
    generateFaq?: boolean;
  };
  includeCta?: boolean;
}

export interface GeneratedBlogResponse {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  metaDescription: string;
  readTime: string;
  content: string;
  keywords: string[];
  tags: string[];
  faq: Array<{ question: string; answer: string }>;
}

interface ExtractedError {
  code: number;
  status: string;
  message: string;
  isRetryable: boolean;
}

function parseGeminiError(err: any): ExtractedError {
  let code = 500;
  let status = "INTERNAL";
  let message = "";

  if (typeof err === "string") {
    message = err;
  } else if (err) {
    message = err.message || "";

    // Check nested err.error from API response
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

  // Check if message is a JSON string from SDK
  if (message && message.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(message);
      if (parsed.error) {
        if (parsed.error.code) code = Number(parsed.error.code);
        if (parsed.error.status) status = parsed.error.status;
        if (parsed.error.message) message = parsed.error.message;
      }
    } catch {
      // Keep original message if parsing fails
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
    combined.includes("UNAUTHENTICATED")
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

export async function POST(request: Request) {
  try {
    // 1. Check API Key configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEMINI_API_KEY belum dikonfigurasi di server. Silakan tambahkan GEMINI_API_KEY di file .env.local untuk local development atau di Vercel Environment Variables untuk production.",
        },
        { status: 500 }
      );
    }

    // 2. Simple Rate Limiting check
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "admin-client";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Terlalu banyak permintaan generate dalam waktu singkat. Mohon tunggu 1 menit sebelum mencoba lagi.",
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate body
    let body: GenerateBlogRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Payload JSON tidak valid." },
        { status: 400 }
      );
    }

    const {
      topic,
      category = "",
      focus = "",
      targetAudience = "",
      purpose = "",
      writingStyle = "Travel Blog",
      articleLength = "800 words",
      primaryKeyword = "",
      secondaryKeywords = [],
      seoOptions = {
        generateTitle: true,
        generateMetaDescription: true,
        generateSlug: true,
        generateKeywords: true,
        generateFaq: true,
      },
      includeCta = true,
    } = body;

    const trimmedTopic = topic?.trim();
    if (!trimmedTopic) {
      return NextResponse.json(
        { success: false, error: "Topik artikel wajib diisi." },
        { status: 400 }
      );
    }

    if (trimmedTopic.length < 3) {
      return NextResponse.json(
        { success: false, error: "Topik artikel terlalu pendek (minimal 3 karakter)." },
        { status: 400 }
      );
    }

    if (trimmedTopic.length > 300) {
      return NextResponse.json(
        { success: false, error: "Topik artikel maksimal 300 karakter demi keamanan prompt." },
        { status: 400 }
      );
    }

    const audienceStr = Array.isArray(targetAudience)
      ? targetAudience.join(", ")
      : targetAudience;

    // Map length
    let targetWordCount = "800 words";
    if (articleLength === "Short" || articleLength === "500 words") targetWordCount = "500 words";
    else if (articleLength === "Medium" || articleLength === "800 words") targetWordCount = "800 words";
    else if (articleLength === "Long" || articleLength === "1200 words") targetWordCount = "1200 words";
    else if (articleLength === "Comprehensive" || articleLength === "1500 words") targetWordCount = "1500 words";

    // 4. Construct System Instruction & Prompt
    const systemInstruction = `You are a senior travel content writer and SEO specialist for "Ijen Tour" (ijentour.com), the premier expedition and tour operator for Mount Ijen (Kawah Ijen Volcano) in Banyuwangi, East Java, Indonesia.

Your writing standards:
1. Tone & Persona: Natural, engaging, inspiring, and informative. The content must feel human-crafted by seasoned local expedition guides and travel writers, NEVER robotic or generic AI text.
2. Tone of Voice & Style: Follow the requested style ("${writingStyle}").
${focus ? `3. Focal Angle: Strictly align the perspective with: "${focus}".` : ""}
${audienceStr ? `4. Target Audience: Tailor explanations, tips, and difficulty notes specifically for: "${audienceStr}".` : ""}
${purpose ? `5. Editorial Intent: Structure the flow to serve as a high-value "${purpose}".` : ""}
6. Factual Accuracy & Integrity:
   - ALWAYS adhere to authentic facts about Mount Ijen:
     * Located on the border between Banyuwangi and Bondowoso regencies, East Java.
     * World-famous for the electric Blue Fire (natural sulfuric gas combustion at high temperatures, visible only in complete darkness between ~02:00 AM and 04:30 AM before sunrise).
     * World's largest highly acidic crater lake (pH < 0.5) with stunning turquoise water.
     * Traditional sulfur miners who carry heavy sulfur slabs (70-90 kg) up the steep crater rim.
     * Paltuding Base Camp is the starting point at ~1,850m elevation; the summit rim is at ~2,799m asl.
     * Trekking distance is approx. 3 to 3.5 km with a steep gradient.
     * Required safety equipment: professional certified gas mask (respirator with gas filters for toxic sulfur dioxide / SO2 vapors), headlamp, layered clothing (temperatures can drop to 8-12°C before dawn), and sturdy trekking boots.
     * Accessible via Banyuwangi (train station / airport) or from Bali via Ketapang-Gilimanuk ferry.
   - NEVER invent fictional prices, fake departure schedules, false regulations, or imaginary attractions. If pricing or park operating hours vary, mention that they follow official BKSDA park policies or suggest consulting Ijen Tour for the latest updates.
   - Natural SEO Integration: ${primaryKeyword ? `Naturally incorporate the primary keyword "${primaryKeyword}" in the title, the introduction, and relevant subheadings.` : "Natural keyword integration."} No keyword stuffing.

7. STRICT MARKDOWN FORMATTING RULES FOR "content":
   - STRICTLY PURE MARKDOWN ONLY. NEVER use raw HTML tags (NO <h2>, <p>, <ul>, <li>, <div>, <br>, etc.).
   - NEVER output a top-level H1 title (e.g., "# Title") inside "content" because the title is stored separately in the "title" field.
   - Use "## " for main sections (e.g., "## Why Visit Mount Ijen?").
   - Use "### " for subsections under main sections (e.g., "### 1. The Electric Blue Fire Phenomenon").
   - Do NOT turn every sentence into a heading; use headings thoughtfully for logical structure.
   - Separate every paragraph with a double newline (blank line between paragraphs).
   - Keep paragraphs relatively short (2-4 sentences) for pleasant reading on mobile screens.
   - For bullet points, strictly use hyphen with space: "- Item name". NEVER use "•", "*", or HTML <ul><li>.
   - For sequential steps, itineraries, or preparation checklists, strictly use numbered lists: "1. Step", "2. Step".
   - Use bold ("**text**") for key highlights naturally.
   - Use italic ("*text*") sparingly only when appropriate.
   - Use blockquotes ("> Note / Quote") when providing an important safety warning, local insight, or key takeaway.
   - Structure Flow:
     * Hook opening paragraph
     * 2-4 comprehensive thematic sections with "## " headings and "### " subsections
     * Preparation or gear section with numbered list ("1. ...") or bullet points ("- ...")
     * Practical travel tips with bullet points ("- ...")
     * Clear concluding section ("## Conclusion" or "## Kesimpulan")
   - Adapt depth to the requested target length (${targetWordCount}).

8. FAQ SEPARATION RULE:
   - Do NOT duplicate or append the FAQ section inside the "content" markdown field.
   - The FAQ questions and answers must ONLY be placed in the dedicated "faq" JSON array in the response schema.

9. Call-to-Action (CTA):
   - ${
     includeCta
       ? `Include an organic, helpful Call-to-Action at the end of the conclusion in "content", inviting travelers to join an all-inclusive guided Ijen Tour expedition (with certified local guides, safety respirators, and roundtrip hotel transfers). Keep it tasteful and professional.`
       : `Do not include promotional sales pitches or commercial booking CTAs.`
   }
10. Frequently Asked Questions (FAQ):
   - ${
     seoOptions.generateFaq !== false
       ? `Generate 3 to 5 realistic, high-value FAQ questions and thorough answers addressing common traveler concerns regarding this specific topic in the "faq" array.`
       : `Provide an empty array for faq if not requested.`
   }
`;

    const userPrompt = `Generate a complete, high-ranking, engaging blog post about the following:
Topic: "${trimmedTopic}"
${category ? `Category: "${category}"` : ""}
${focus ? `Focal Angle: "${focus}"` : ""}
${audienceStr ? `Target Audience: "${audienceStr}"` : ""}
${purpose ? `Article Purpose: "${purpose}"` : ""}
Writing Style: ${writingStyle}
Target Length: Approximately ${targetWordCount}
${primaryKeyword ? `Primary Keyword: "${primaryKeyword}"` : ""}
${secondaryKeywords && secondaryKeywords.length > 0 ? `Secondary Keywords: ${secondaryKeywords.join(", ")}` : ""}

SEO Preferences:
- SEO Title: ${seoOptions.generateTitle !== false ? "Yes" : "Standard"}
- Meta Description: ${seoOptions.generateMetaDescription !== false ? "Yes (under 160 characters)" : "Brief summary"}
- Slug: ${seoOptions.generateSlug !== false ? "Yes (lowercase, hyphenated, clean URL)" : "Generated"}
- Primary & Secondary Keywords: ${seoOptions.generateKeywords !== false ? "Yes" : "Basic"}
- Relevant Tags: Yes
- FAQ Section: ${seoOptions.generateFaq !== false ? "Yes (3-5 items in faq array only)" : "No"}
- Include Ijen Tour Booking CTA: ${includeCta ? "Yes" : "No"}

Write the article in the natural language matching the topic title provided.
Remember: "content" must be clean, structured PURE MARKDOWN without HTML and without repeating the H1 title.`;

    // 5. Initialize Google Gen AI client
    const ai = new GoogleGenAI({ apiKey });

    // Define response schema for structured output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Engaging and SEO-friendly article title (H1)",
        },
        slug: {
          type: Type.STRING,
          description: "URL-safe lowercase hyphenated slug (e.g. best-time-to-visit-mount-ijen)",
        },
        category: {
          type: Type.STRING,
          description: "Category matching or reflecting the topic/category specified",
        },
        excerpt: {
          type: Type.STRING,
          description: "Compelling 1-2 sentence preview excerpt (approx 120-160 characters)",
        },
        metaDescription: {
          type: Type.STRING,
          description: "SEO meta description under 160 characters with natural keywords",
        },
        readTime: {
          type: Type.STRING,
          description: "Estimated reading time, e.g. '5 Menit Baca' or '6 min read'",
        },
        content: {
          type: Type.STRING,
          description:
            "The full pure markdown content of the article using ## and ### headings, short paragraphs separated by blank lines, bullet points (-), numbered lists (1.), blockquotes (>), and bold text (**bold**). Strictly no HTML tags and no H1 (# Title). Do not duplicate FAQ inside this field.",
        },
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "4-8 primary and secondary SEO keywords",
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3-6 relevant tags",
        },
        faq: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            },
            required: ["question", "answer"],
          },
          description: "3-5 frequently asked questions and answers",
        },
      },
      required: ["title", "slug", "excerpt", "metaDescription", "content"],
    };

    // Priority fallback model chain verified via models.list() and direct generateContent tests
    const modelsToTry = [
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-3.7-flash",
      "gemini-pro-latest",
    ];

    let rawText = "";
    const errorsHistory: ExtractedError[] = [];

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelName = modelsToTry[i];
      console.log(`[Gemini Blog Generator] Trying model: ${modelName}`);

      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (response && response.text) {
          rawText = response.text;
          console.log(`[Gemini Blog Generator] Successfully generated blog using ${modelName}`);
          break; // Succeeded! Stop iterating
        }
      } catch (err: any) {
        const extracted = parseGeminiError(err);
        errorsHistory.push(extracted);

        // Fatal errors: don't attempt other models if API key is invalid or request is malformed
        if (extracted.code === 401 || extracted.code === 403) {
          console.warn(`[Gemini Blog Generator] Authentication failed (${extracted.code}). Stopping.`);
          break;
        }

        if (extracted.code === 400 && !extracted.isRetryable) {
          console.warn(`[Gemini Blog Generator] Bad request or safety issue (${extracted.code}). Stopping.`);
          break;
        }

        // For 503 or 429: immediately switch to the next fallback model
        const nextModel = modelsToTry[i + 1];
        if (nextModel) {
          console.warn(
            `[Gemini Blog Generator] Model ${modelName} failed with ${extracted.code}. Trying fallback model: ${nextModel}`
          );
        } else {
          console.error(
            `[Gemini Blog Generator] All models failed. Last error: ${extracted.code} (${extracted.status})`
          );
        }
      }
    }

    if (!rawText) {
      // Prioritize 401/403, 503, or 429 encountered during the fallback sequence
      const saw401 = errorsHistory.some(
        (e) => e.code === 401 || e.code === 403 || e.status === "UNAUTHENTICATED"
      );
      const saw503 = errorsHistory.some(
        (e) => e.code === 503 || e.status === "UNAVAILABLE"
      );
      const saw429 = errorsHistory.some(
        (e) => e.code === 429 || e.status === "RESOURCE_EXHAUSTED"
      );

      if (saw401) {
        return NextResponse.json(
          {
            success: false,
            error: "GEMINI_API_KEY tidak valid atau tidak memiliki izin akses. Periksa kembali API Key Anda.",
          },
          { status: 401 }
        );
      }

      if (saw503) {
        return NextResponse.json(
          {
            success: false,
            error: "Gemini AI sedang mengalami beban tinggi. Silakan coba lagi beberapa saat.",
          },
          { status: 503 }
        );
      }

      if (saw429) {
        return NextResponse.json(
          {
            success: false,
            error: "Batas kuota Gemini API tercapai (Rate limit). Silakan coba lagi setelah beberapa menit.",
          },
          { status: 429 }
        );
      }

      const lastError = errorsHistory[errorsHistory.length - 1];
      if (lastError?.code === 400) {
        const isSafety =
          lastError.message.toUpperCase().includes("SAFETY") ||
          lastError.message.toUpperCase().includes("BLOCKED");
        return NextResponse.json(
          {
            success: false,
            error: isSafety
              ? "Konten ditolak oleh sistem keamanan AI Gemini. Mohon sesuaikan topik artikel."
              : "Permintaan generate artikel tidak valid (400 Bad Request).",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Gagal menghasilkan artikel dengan Gemini API. Mohon periksa API Key atau coba lagi beberapa saat kemudian.",
        },
        { status: 500 }
      );
    }

    // 6. Parse structured JSON output
    let parsedData: GeneratedBlogResponse;
    try {
      // Remove any possible markdown fences if returned
      const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("[Gemini Blog Generator] JSON parsing error:", parseErr, "Raw output:", rawText);
      return NextResponse.json(
        {
          success: false,
          error: "Format respon dari Gemini API tidak dapat diproses. Silakan coba generate kembali.",
        },
        { status: 502 }
      );
    }

    // 7. Sanitize and validate fields
    const validCategories = ["Panduan", "Tips & Trik", "Edukasi Ijen", "Budaya Lokal", "Kuliner", "Destinasi"];
    const resolvedCategory = (category && category.trim())
      ? category.trim()
      : validCategories.includes(parsedData.category)
      ? parsedData.category
      : "Panduan";

    const cleanSlug = (parsedData.slug || parsedData.title || trimmedTopic)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Sanitize and validate content markdown
    let cleanContent = (parsedData.content || "").trim();
    // Strip accidental leading H1 (# Title)
    cleanContent = cleanContent.replace(/^#\s+[^\n]+\n*/, "").trim();

    if (!cleanContent || cleanContent.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "AI tidak berhasil menghasilkan konten artikel yang memadai. Silakan coba generate kembali.",
        },
        { status: 502 }
      );
    }

    // Merge primary and secondary keywords uniquely
    const keywordsSet = new Set<string>();
    if (primaryKeyword && primaryKeyword.trim()) {
      keywordsSet.add(primaryKeyword.trim());
    }
    if (Array.isArray(secondaryKeywords)) {
      secondaryKeywords.forEach((kw) => {
        if (kw && typeof kw === "string" && kw.trim()) keywordsSet.add(kw.trim());
      });
    }
    if (Array.isArray(parsedData.keywords)) {
      parsedData.keywords.forEach((kw) => {
        if (kw && typeof kw === "string" && kw.trim()) keywordsSet.add(kw.trim());
      });
    }

    const wordCount = cleanContent.split(/\s+/).filter(Boolean).length;
    const computedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));
    const finalReadTime = parsedData.readTime || `${computedReadMinutes} Menit Baca`;

    const finalResponse: GeneratedBlogResponse = {
      title: parsedData.title || trimmedTopic,
      slug: cleanSlug,
      category: resolvedCategory,
      excerpt: parsedData.excerpt || parsedData.metaDescription || "",
      metaDescription: parsedData.metaDescription || parsedData.excerpt || "",
      readTime: finalReadTime,
      content: cleanContent,
      keywords: Array.from(keywordsSet),
      tags: Array.isArray(parsedData.tags) ? parsedData.tags : [],
      faq: Array.isArray(parsedData.faq) ? parsedData.faq : [],
    };

    return NextResponse.json({
      success: true,
      data: finalResponse,
    });
  } catch (error: any) {
    console.error("[Gemini Blog Generator] Unexpected server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal pada server saat memproses permintaan AI.",
      },
      { status: 500 }
    );
  }
}
