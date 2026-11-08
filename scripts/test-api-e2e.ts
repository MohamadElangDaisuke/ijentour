import "dotenv/config";
import { POST } from "../app/api/ai/travel-assistant/route";
import { prisma } from "../lib/prisma";

const queries = [
  "p",
  "h",
  "a",
  "123",
  "???",
  "asdfgh",
  "hi",
  "hello",
  "OK",
  "Why?",
  "berapa harga paket?",
  "Can you recommend a tour?",
];

async function testApiDirectly() {
  console.log("=== API ROUTE DIRECT TEST (/api/ai/travel-assistant) ===");
  for (const q of queries) {
    const req = new Request("http://localhost:3000/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: q }] }),
    });

    const res = await POST(req);
    const data = await res.json();
    console.log(`Query: "${q}"`);
    console.log(`Status: ${res.status} | Success: ${data.success} | Source: ${data.source}`);
    console.log(`Message: "${data.message?.replace(/\n/g, " ").slice(0, 100)}..."`);
    console.log("------------------------------------------------------------------");
  }
}

testApiDirectly()
  .catch((err) => {
    console.error("API test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });

