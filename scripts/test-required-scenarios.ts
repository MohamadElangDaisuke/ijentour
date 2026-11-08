import "dotenv/config";
import { processHybridChatMessage } from "../lib/ai/chatbot/orchestrator";
import { prisma } from "../lib/prisma";

async function runRequiredScenarios() {
  console.log("==========================================================================");
  console.log("   MANDATORY TESTING SUITE: 12 REQUIRED CHATBOT SCENARIOS                ");
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

  // Scenario 1: What is Ijen?
  console.log("\n--- Scenario 1: 'What is Ijen?' ---");
  const res1 = await processHybridChatMessage({
    messages: [{ role: "user", content: "What is Ijen?" }],
  });
  assert(
    res1.success &&
      (res1.message.toLowerCase().includes("stratovolcano") ||
        res1.message.toLowerCase().includes("volcano") ||
        res1.message.toLowerCase().includes("active volcano")) &&
      !res1.message.toLowerCase().includes("apakah aman") &&
      !res1.message.toLowerCase().includes("anak-anak"),
    "What is Ijen? returns general explanation of Mount Ijen without hallucinating child/elderly safety FAQ",
    `Excerpt: "${res1.message.slice(0, 130)}..."`
  );

  // Scenario 2: What is Blue Fire?
  console.log("\n--- Scenario 2: 'What is Blue Fire?' ---");
  const res2 = await processHybridChatMessage({
    messages: [{ role: "user", content: "What is Blue Fire?" }],
  });
  assert(
    res2.success &&
      (res2.message.toLowerCase().includes("sulfuric gas") ||
        res2.message.toLowerCase().includes("sulfur") ||
        res2.message.toLowerCase().includes("blue flame") ||
        res2.message.toLowerCase().includes("electric")),
    "What is Blue Fire? returns scientific/natural explanation of the phenomenon",
    `Excerpt: "${res2.message.slice(0, 130)}..."`
  );

  // Scenario 3: Where is Mount Ijen located?
  console.log("\n--- Scenario 3: 'Where is Mount Ijen located?' ---");
  const res3 = await processHybridChatMessage({
    messages: [{ role: "user", content: "Where is Mount Ijen located?" }],
  });
  assert(
    res3.success &&
      res3.message.toLowerCase().includes("east java") &&
      (res3.message.toLowerCase().includes("banyuwangi") || res3.message.toLowerCase().includes("bondowoso")),
    "Where is Mount Ijen located? returns relevant geographical explanation",
    `Excerpt: "${res3.message.slice(0, 130)}..."`
  );

  // Scenario 4: Is it safe to hike Ijen?
  console.log("\n--- Scenario 4: 'Is it safe to hike Ijen?' ---");
  const res4 = await processHybridChatMessage({
    messages: [{ role: "user", content: "Is it safe to hike Ijen?" }],
  });
  assert(
    res4.success &&
      (res4.message.toLowerCase().includes("gas mask") ||
        res4.message.toLowerCase().includes("sulfur dioxide") ||
        res4.message.toLowerCase().includes("health certificate") ||
        res4.message.toLowerCase().includes("moderate to challenging")),
    "Is it safe to hike Ijen? uses verified safety information from official knowledge base",
    `Excerpt: "${res4.message.slice(0, 130)}..."`
  );

  // Scenario 5: What packages do you offer?
  console.log("\n--- Scenario 5: 'What packages do you offer?' ---");
  const res5 = await processHybridChatMessage({
    messages: [{ role: "user", content: "What packages do you offer?" }],
  });
  assert(
    res5.success &&
      (res5.message.toLowerCase().includes("package") || res5.message.toLowerCase().includes("tour")) &&
      (res5.message.includes("Rp") || res5.message.includes("IDR") || res5.message.includes("Midnight")),
    "What packages do you offer? retrieves active tour packages from live database",
    `Excerpt: "${res5.message.slice(0, 130)}..."`
  );

  // Scenario 6: How much is the Blue Fire tour?
  console.log("\n--- Scenario 6: 'How much is the Blue Fire tour?' ---");
  const res6 = await processHybridChatMessage({
    messages: [{ role: "user", content: "How much is the Blue Fire tour?" }],
  });
  assert(
    res6.success &&
      (res6.message.includes("750.000") || res6.message.includes("750,000") || res6.message.toLowerCase().includes("midnight")),
    "How much is the Blue Fire tour? retrieves actual package price from database",
    `Excerpt: "${res6.message.slice(0, 130)}..."`
  );

  // Scenario 7: Why still Indo language?
  console.log("\n--- Scenario 7: 'Why still Indo language?' ---");
  const res7 = await processHybridChatMessage({
    messages: [
      { role: "user", content: "What is Ijen?" },
      { role: "assistant", content: "### ❓ Apakah aman mendaki Kawah Ijen bersama anak-anak atau lansia?\n\nSangat aman..." },
      { role: "user", content: "Why still Indo language?" },
    ],
  });
  assert(
    res7.success &&
      (res7.message.toLowerCase().includes("sorry") || res7.message.toLowerCase().includes("apologize")) &&
      res7.message.toLowerCase().includes("english"),
    "Why still Indo language? understands language correction and apologizes politely in English",
    `Message: "${res7.message.slice(0, 140)}..."`
  );

  // Scenario 8: Please explain in English
  console.log("\n--- Scenario 8: 'Please explain in English' ---");
  const res8 = await processHybridChatMessage({
    messages: [{ role: "user", content: "Please explain in English" }],
  });
  assert(
    res8.success &&
      res8.message.toLowerCase().includes("english") &&
      !res8.message.toLowerCase().includes("maaf, saya hanya"),
    "Please explain in English responds politely in English without falling back to out-of-topic",
    `Message: "${res8.message.slice(0, 140)}..."`
  );

  // Scenario 9: What about the second package?
  console.log("\n--- Scenario 9: 'What about the second package?' ---");
  const res9 = await processHybridChatMessage({
    messages: [
      { role: "user", content: "What packages do you offer?" },
      { role: "assistant", content: "Here are our tour packages: 1. Midnight Expedition Blue Fire Ijen. 2. Kawah Wurung & Djawatan Green Escape." },
      { role: "user", content: "What about the second package?" },
    ],
    context: { turnCount: 1 },
  });
  assert(
    res9.success &&
      (res9.message.toLowerCase().includes("kawah wurung") ||
        res9.message.toLowerCase().includes("djawatan") ||
        res9.message.toLowerCase().includes("duration") ||
        res9.message.toLowerCase().includes("price")),
    "What about the second package? understands ordinal context and references package #2",
    `Excerpt: "${res9.message.slice(0, 140)}..."`
  );

  // Scenario 10: Can I book this tour?
  console.log("\n--- Scenario 10: 'Can I book this tour?' ---");
  const res10 = await processHybridChatMessage({
    messages: [{ role: "user", content: "Can I book this tour?" }],
  });
  assert(
    Boolean(
      res10.success &&
        res10.message.toLowerCase().includes("whatsapp") &&
        res10.handoff &&
        (res10.handoff.action === "whatsapp" || res10.handoff.action === "both")
    ),
    "Can I book this tour? provides booking assistance and triggers WhatsApp handoff",
    `Handoff action: "${res10.handoff?.action}", Message: "${res10.message.slice(0, 120)}..."`
  );

  // Scenario 11: What is the weather today?
  console.log("\n--- Scenario 11: 'What is the weather today?' ---");
  const res11 = await processHybridChatMessage({
    messages: [{ role: "user", content: "What is the weather today?" }],
  });
  assert(
    res11.success &&
      (res11.message.toLowerCase().includes("real-time") ||
        res11.message.toLowerCase().includes("sensors") ||
        res11.message.toLowerCase().includes("live weather") ||
        res11.message.toLowerCase().includes("temperature")) &&
      (res11.message.includes("8°C") || res11.message.includes("8-12°C") || res11.message.toLowerCase().includes("night")),
    "What is the weather today? explains real-time limitation honestly and describes typical summit conditions",
    `Excerpt: "${res11.message.slice(0, 140)}..."`
  );

  // Scenario 12: Who is the president?
  console.log("\n--- Scenario 12: 'Who is the president?' ---");
  const res12 = await processHybridChatMessage({
    messages: [{ role: "user", content: "Who is the president?" }],
  });
  assert(
    res12.success &&
      res12.message.includes("I'm here to help with Mount Ijen tours") &&
      res12.source === "guardrail_rejected",
    "Who is the president? politely declined as outside Ijen Tour scope",
    `Message: "${res12.message}"`
  );

  console.log("\n==========================================================================");
  console.log(`   TEST RESULTS: ${totalPassed} / ${totalTests} TESTS PASSED   `);
  console.log("==========================================================================");
}

runRequiredScenarios()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });

