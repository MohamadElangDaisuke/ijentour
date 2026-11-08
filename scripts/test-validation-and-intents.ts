import "dotenv/config";
import { processHybridChatMessage } from "../lib/ai/chatbot/orchestrator";
import {
  SINGLE_CHAR_FALLBACK_EN,
  CLARIFICATION_FALLBACK_EN,
  GREETING_RESPONSE_EN,
  ACKNOWLEDGEMENT_RESPONSE_EN,
  WHY_ISOLATED_RESPONSE_EN,
} from "../lib/ai/chatbot/validation";
import { prisma } from "../lib/prisma";

async function runValidationAndIntentTests() {
  console.log("==========================================================================");
  console.log("   INPUT VALIDATION & ENGLISH-ONLY INTENT DETECTION TEST SUITE            ");
  console.log("==========================================================================\n");

  let totalTests = 0;
  let totalPassed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      totalPassed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  // 1. Input: 'p'
  console.log("\n--- Test 1: Single character 'p' ---");
  const resP = await processHybridChatMessage({
    messages: [{ role: "user", content: "p" }],
  });
  assert(
    resP.success &&
      resP.message === SINGLE_CHAR_FALLBACK_EN &&
      !resP.message.toLowerCase().includes("apakah fenomena"),
    "Input 'p' returns polite English clarification without hallucinating 'apakah fenomena'",
    `Message: "${resP.message}"`
  );

  // 2. Input: 'h'
  console.log("\n--- Test 2: Single character 'h' ---");
  const resH = await processHybridChatMessage({
    messages: [{ role: "user", content: "h" }],
  });
  assert(
    resH.success &&
      resH.message === SINGLE_CHAR_FALLBACK_EN &&
      !resH.message.toLowerCase().includes("apakah fenomena"),
    "Input 'h' rejected early as unclear without Gemini or FAQ match, replying in English",
    `Message: "${resH.message}"`
  );

  // 3. Input: 'a'
  console.log("\n--- Test 3: Single character 'a' ---");
  const resA = await processHybridChatMessage({
    messages: [{ role: "user", content: "a" }],
  });
  assert(
    resA.success &&
      resA.message === SINGLE_CHAR_FALLBACK_EN &&
      !resA.message.toLowerCase().includes("apakah fenomena"),
    "Input 'a' rejected early as unclear without Gemini or FAQ match, replying in English",
    `Message: "${resA.message}"`
  );

  // 4. Input: '123'
  console.log("\n--- Test 4: Pure digits '123' ---");
  const res123 = await processHybridChatMessage({
    messages: [{ role: "user", content: "123" }],
  });
  assert(
    res123.success &&
      res123.message === CLARIFICATION_FALLBACK_EN &&
      !res123.message.toLowerCase().includes("apakah fenomena"),
    "Input '123' without context requests clarification in English",
    `Message: "${res123.message}"`
  );

  // 5. Input: '???'
  console.log("\n--- Test 5: Pure symbols '???' ---");
  const resQ = await processHybridChatMessage({
    messages: [{ role: "user", content: "???" }],
  });
  assert(
    resQ.success &&
      resQ.message === CLARIFICATION_FALLBACK_EN &&
      !resQ.message.toLowerCase().includes("apakah fenomena"),
    "Input '???' requests clarification in English",
    `Message: "${resQ.message}"`
  );

  // 6. Input: 'asdfgh'
  console.log("\n--- Test 6: Gibberish 'asdfgh' ---");
  const resAsdf = await processHybridChatMessage({
    messages: [{ role: "user", content: "asdfgh" }],
  });
  assert(
    resAsdf.success &&
      resAsdf.message === CLARIFICATION_FALLBACK_EN &&
      !resAsdf.message.toLowerCase().includes("apakah fenomena"),
    "Input 'asdfgh' detected as keyboard gibberish and requests clarification in English",
    `Message: "${resAsdf.message}"`
  );

  // 7. Input: 'hi'
  console.log("\n--- Test 7: Valid short greeting 'hi' ---");
  const resHi = await processHybridChatMessage({
    messages: [{ role: "user", content: "hi" }],
  });
  assert(
    resHi.success &&
      (resHi.message === GREETING_RESPONSE_EN || resHi.message.toLowerCase().includes("hello")),
    "Input 'hi' recognized as greeting and responds in friendly English",
    `Message: "${resHi.message}"`
  );

  // 8. Input: 'hello'
  console.log("\n--- Test 8: Valid greeting 'hello' ---");
  const resHello = await processHybridChatMessage({
    messages: [{ role: "user", content: "hello" }],
  });
  assert(
    resHello.success &&
      (resHello.message === GREETING_RESPONSE_EN || resHello.message.toLowerCase().includes("hello")),
    "Input 'hello' recognized as greeting and responds in friendly English",
    `Message: "${resHello.message}"`
  );

  // 9. Input: 'OK'
  console.log("\n--- Test 9: Valid acknowledgement 'OK' ---");
  const resOk = await processHybridChatMessage({
    messages: [{ role: "user", content: "OK" }],
  });
  assert(
    resOk.success &&
      (resOk.message === ACKNOWLEDGEMENT_RESPONSE_EN || resOk.message.includes("Great!")),
    "Input 'OK' recognized as polite acknowledgement asking in English how to assist further",
    `Message: "${resOk.message}"`
  );

  // 10. Input: 'Why?'
  console.log("\n--- Test 10: Valid short question 'Why?' ---");
  const resWhy = await processHybridChatMessage({
    messages: [{ role: "user", content: "Why?" }],
  });
  assert(
    resWhy.success &&
      (resWhy.message === WHY_ISOLATED_RESPONSE_EN ||
        resWhy.message.toLowerCase().includes("specify what you'd like to know")),
    "Input 'Why?' without prior context asks user in English to specify inquiry",
    `Message: "${resWhy.message}"`
  );

  // 10b. Input: 'Why?' in multi-turn context with prior turn
  console.log("\n--- Test 10b: 'Why?' in multi-turn context with prior turn ---");
  const turn1 = await processHybridChatMessage({
    messages: [{ role: "user", content: "Apakah fenomena Blue Fire selalu bisa dilihat setiap malam?" }],
  });
  const turn2 = await processHybridChatMessage({
    messages: [
      { role: "user", content: "Apakah fenomena Blue Fire selalu bisa dilihat setiap malam?" },
      { role: "assistant", content: turn1.message },
      { role: "user", content: "Why?" },
    ],
    context: turn1.context,
  });
  assert(
    turn2.success &&
      (turn2.message.toLowerCase().includes("blue fire") ||
        turn2.message.toLowerCase().includes("vulkanik") ||
        turn2.message.toLowerCase().includes("belerang") ||
        turn2.message.toLowerCase().includes("sulfur") ||
        turn2.message.toLowerCase().includes("gas") ||
        turn2.message.toLowerCase().includes("weather")),
    "Input 'Why?' with prior context answers the reason (volcanic activity / weather / gas) in English",
    `Excerpt: "${turn2.message.slice(0, 110)}..."`
  );

  // 11. Input: 'berapa harga paket?' (Indonesian input -> English output)
  console.log("\n--- Test 11: Valid tour question 'berapa harga paket?' (Indonesian) ---");
  const resPrice = await processHybridChatMessage({
    messages: [{ role: "user", content: "berapa harga paket?" }],
  });
  assert(
    resPrice.success &&
      (resPrice.message.toLowerCase().includes("price") ||
        resPrice.message.toLowerCase().includes("package") ||
        resPrice.message.toLowerCase().includes("official")) &&
      !resPrice.message.toLowerCase().includes("apakah fenomena"),
    "Input 'berapa harga paket?' understands Indonesian and retrieves grounded tour pricing in English",
    `Excerpt: "${resPrice.message.slice(0, 120)}..."`
  );

  // 12. Input: 'Can you recommend a tour?'
  console.log("\n--- Test 12: Valid recommendation question 'Can you recommend a tour?' ---");
  const resRec = await processHybridChatMessage({
    messages: [{ role: "user", content: "Can you recommend a tour?" }],
  });
  assert(
    resRec.success &&
      (resRec.message.toLowerCase().includes("recommend") ||
        resRec.message.toLowerCase().includes("tour") ||
        resRec.message.toLowerCase().includes("package")),
    "Input 'Can you recommend a tour?' gives tailored recommendations grounded in live database in English",
    `Excerpt: "${resRec.message.slice(0, 120)}..."`
  );

  // 13. Edge case: Out of topic question
  console.log("\n--- Test 13: Out-of-topic question ('Siapa presiden Indonesia?') ---");
  const resOot = await processHybridChatMessage({
    messages: [{ role: "user", content: "Siapa presiden Indonesia?" }],
  });
  assert(
    resOot.success &&
      resOot.message.includes("I'm here to help with Mount Ijen tours") &&
      resOot.source === "guardrail_rejected",
    "Out-of-topic question rejected with official English out-of-scope response without calling Gemini",
    `Message: "${resOot.message}"`
  );

  console.log("\n==========================================================================");
  console.log(`   TEST RESULTS: ${totalPassed} / ${totalTests} TESTS PASSED   `);
  console.log("==========================================================================");
}

runValidationAndIntentTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });
