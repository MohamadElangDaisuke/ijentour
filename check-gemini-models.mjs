import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY tidak ditemukan di .env");
  process.exit(1);
}

console.log("✅ GEMINI_API_KEY ditemukan");
console.log("🔎 Mengecek model yang tersedia...\n");

const ai = new GoogleGenAI({
  apiKey,
});

try {
  const response = await ai.models.list();

  console.log("Response type:", typeof response);
  console.log("Response keys:", Object.keys(response));

  if (response.page) {
    console.log("\n📋 DAFTAR MODEL:\n");

    for (const model of response.page) {
      console.log("MODEL:", model.name);
      console.log("ACTIONS:", model.supportedActions || []);
      console.log("--------------------------------");
    }
  } else {
    console.log("\n📦 Response:");
    console.log(response);
  }
} catch (error) {
  console.error("❌ Gagal mengambil daftar model:");
  console.error(error?.message || error);
}