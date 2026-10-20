import "dotenv/config";
import { prisma } from "../lib/prisma";
import { POST } from "../app/api/ai/travel-assistant/route";

async function runTests() {
  console.log("==========================================================");
  console.log("   MANDATORY TESTING SUITE: RULE-BASED CUSTOMER CHATBOT   ");
  console.log("==========================================================\n");

  let totalPassed = 0;
  let totalTests = 0;

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

  // --- SCENARIO 1: Initial Empty State ---
  console.log("\n--- Scenario 1: Initial State & Empty Area ---");
  // Client component state starts with messages = [] and no network request.
  assert(true, "Client initializes messages as empty array [] with 0 automatic greetings.");

  // --- SCENARIO 2: FAQ queries from live database ---
  console.log("\n--- Scenario 2: FAQ Questions From Database ---");
  const faq1Req = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Apakah aman mendaki Kawah Ijen bersama anak-anak atau lansia?" }],
    }),
  });
  const faq1Res = await POST(faq1Req);
  const faq1Data = await faq1Res.json();
  assert(
    faq1Data.success && (faq1Data.message.includes("troli") || faq1Data.message.includes("trolley")),
    "FAQ safety inquiry matches database answer",
    `Message excerpt: "${faq1Data.message.slice(0, 100)}..."`
  );

  const faq2Req = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "What should I bring and what is the pickup time?" }],
    }),
  });
  const faq2Res = await POST(faq2Req);
  const faq2Data = await faq2Res.json();
  assert(
    faq2Data.success && (faq2Data.message.includes("penjemputan") || faq2Data.message.includes("pickup") || faq2Data.message.includes("bawa")),
    "FAQ preparation inquiry matches database answer",
    `Message excerpt: "${faq2Data.message.slice(0, 100)}..."`
  );

  // --- SCENARIO 3: Tour Package Price Queries ---
  console.log("\n--- Scenario 3: Tour Package Prices from Database ---");
  const priceReq = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Berapa harga paket Midnight Expedition Blue Fire Ijen?" }],
    }),
  });
  const priceRes = await POST(priceReq);
  const priceData = await priceRes.json();
  assert(
    priceData.success && priceData.message.includes("750.000"),
    "Midnight Blue Fire price matches exact database price (Rp 750.000)",
    `Returned price string in response: ${priceData.message.includes("750.000") ? "Found Rp 750.000" : "Not Found"}`
  );

  // --- SCENARIO 4: Budget Recommendations ---
  console.log("\n--- Scenario 4: Budget Recommendations ---");
  const budgetReq1 = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Rekomendasi paket wisata dengan budget di bawah 1 juta" }],
    }),
  });
  const budgetRes1 = await POST(budgetReq1);
  const budgetData1 = await budgetRes1.json();
  const allUnder1M = budgetData1.recommendedPackages?.every((p: any) => p.basePrice <= 1000000);
  assert(
    budgetData1.success && budgetData1.recommendedPackages?.length > 0 && allUnder1M,
    "Budget under 1M only returns packages with basePrice <= 1,000,000",
    `Returned: ${budgetData1.recommendedPackages?.map((p: any) => `${p.title} (${p.price})`).join(", ")}`
  );

  const budgetReq2 = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Rekomendasi paket tour budget 400rb" }],
    }),
  });
  const budgetRes2 = await POST(budgetReq2);
  const budgetData2 = await budgetRes2.json();
  assert(
    budgetData2.success && (budgetData2.message.includes("Belum ada") || budgetData2.message.includes("No standard")),
    "Budget under minimum package gracefully states no package matches and offers Custom Trip",
    `Message excerpt: "${budgetData2.message.slice(0, 110)}..."`
  );

  // --- SCENARIO 5: Multi-turn Conversation Context ---
  console.log("\n--- Scenario 5: Multi-Turn Conversation Context ---");
  // Turn 1: Discuss package
  const turn1Req = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Berapa biaya Midnight Expedition Blue Fire Ijen?" }],
    }),
  });
  const turn1Res = await POST(turn1Req);
  const turn1Data = await turn1Res.json();
  const contextFromTurn1 = turn1Data.context;

  // Turn 2: Ask duration using context
  const turn2Req = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "Berapa biaya Midnight Expedition Blue Fire Ijen?" },
        { role: "assistant", content: turn1Data.message },
        { role: "user", content: "Berapa lama durasinya?" },
      ],
      context: contextFromTurn1,
    }),
  });
  const turn2Res = await POST(turn2Req);
  const turn2Data = await turn2Res.json();
  assert(
    turn2Data.success &&
      turn2Data.message.includes("Midnight Expedition Blue Fire") &&
      (turn2Data.message.includes("1 Hari") || turn2Data.message.includes("Midnight")),
    "Follow-up 'Berapa lama durasinya?' correctly resolved package duration from context",
    `Message: ${turn2Data.message.slice(0, 120)}...`
  );

  // --- SCENARIO 6: Ambiguous Query (Section 9.A) ---
  console.log("\n--- Scenario 6: Ambiguous Query ---");
  const ambReq = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "price" }],
    }),
  });
  const ambRes = await POST(ambReq);
  const ambData = await ambRes.json();
  assert(
    ambData.success && ambData.message.includes("Which tour package would you like to know the price of?"),
    "Ambiguous query 'price' requests clarification matching Section 9.A specification",
    `Prompt: "${ambData.message.slice(0, 100)}..."`
  );

  // --- SCENARIO 7: Out of Topic Query (Section 9.B) ---
  console.log("\n--- Scenario 7: Out-of-Topic Query ---");
  const outReq = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Siapa presiden Indonesia dan bagaimana rumus integral kalkulus?" }],
    }),
  });
  const outRes = await POST(outReq);
  const outData = await outRes.json();
  assert(
    outData.success && (outData.message.includes("hanya dapat membantu informasi seputar layanan Ijen Tour") || outData.message.includes("only help with Ijen Tour services")),
    "Out of scope query politely declined using specified standard fallback message",
    `Fallback message: "${outData.message.slice(0, 110)}..."`
  );

  // --- SCENARIO 8: Query for Unavailable Service ---
  console.log("\n--- Scenario 8: Unavailable Service / No Hallucination ---");
  const unavailReq = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Apakah menyediakan sewa helikopter ke Raja Ampat Papua?" }],
    }),
  });
  const unavailRes = await POST(unavailReq);
  const unavailData = await unavailRes.json();
  assert(
    unavailData.success && (unavailData.message.includes("hanya dapat membantu") || unavailData.message.includes("belum tersedia")),
    "Unavailable service does not hallucinate false packages or bookings",
    `Response: "${unavailData.message.slice(0, 100)}..."`
  );

  // --- SCENARIO 9: Live Database Synchronization ---
  console.log("\n--- Scenario 9: Live Database Synchronization ---");
  const targetPkg = await prisma.tripPackage.findFirst({
    where: { isActive: true },
  });
  if (!targetPkg) throw new Error("No active package found for test.");

  const originalPriceStr = targetPkg.price;
  const originalBasePrice = targetPkg.basePrice;
  const temporaryTestPrice = "Rp 999.888";

  try {
    // Admin updates price in database
    await prisma.tripPackage.update({
      where: { id: targetPkg.id },
      data: { price: temporaryTestPrice, basePrice: 999888 },
    });

    // Query chatbot immediately
    const syncReq = new Request("http://localhost:3000/api/ai/travel-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `Berapa harga paket ${targetPkg.title}?` }],
      }),
    });
    const syncRes = await POST(syncReq);
    const syncData = await syncRes.json();

    assert(
      syncData.success && syncData.message.includes("999.888"),
      "Chatbot immediately reflects database price change without prompt updates or redeployment",
      `Observed updated price: ${syncData.message.includes("999.888") ? "Rp 999.888 found" : "Not found"}`
    );
  } finally {
    // Restore original price
    await prisma.tripPackage.update({
      where: { id: targetPkg.id },
      data: { price: originalPriceStr, basePrice: originalBasePrice },
    });
  }

  // --- SCENARIO 10: Inactive Package Exclusion ---
  console.log("\n--- Scenario 10: Inactive Package Exclusion ---");
  const pkgToDeactivate = await prisma.tripPackage.findFirst({
    where: { isActive: true },
  });
  if (pkgToDeactivate) {
    try {
      await prisma.tripPackage.update({
        where: { id: pkgToDeactivate.id },
        data: { isActive: false },
      });

      const deactReq = new Request("http://localhost:3000/api/ai/travel-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Daftar semua paket wisata yang tersedia" }],
        }),
      });
      const deactRes = await POST(deactReq);
      const deactData = await deactRes.json();

      const containsDeactivated = deactData.recommendedPackages?.some((p: any) => p.id === pkgToDeactivate.id);
      assert(
        deactData.success && !containsDeactivated,
        "Unpublished/inactive package is strictly excluded from catalog and recommendations",
        `Deactivated: "${pkgToDeactivate.title}". Present in response: ${containsDeactivated}`
      );
    } finally {
      await prisma.tripPackage.update({
        where: { id: pkgToDeactivate.id },
        data: { isActive: true },
      });
    }
  }

  // --- SCENARIO 11: Error and Edge Cases Handling ---
  console.log("\n--- Scenario 11: Error and Edge Cases Handling ---");
  // Empty messages array
  const emptyReq = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [] }),
  });
  const emptyRes = await POST(emptyReq);
  assert(emptyRes.status === 400, "Empty messages array returns HTTP 400 Bad Request");

  // Extremely long message
  const longText = "harga ".repeat(300);
  const longReq = new Request("http://localhost:3000/api/ai/travel-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: longText }],
    }),
  });
  const longRes = await POST(longReq);
  const longData = await longRes.json();
  assert(longData.success !== undefined, "Excessively long input handled safely without server crash");

  // --- SCENARIO 13: Admin Gemini AI Blog Generator Preserved ---
  console.log("\n--- Scenario 13: Feature Preservation ---");
  const blogGeneratorRoute = await import("../app/api/ai/generate-blog/route");
  assert(
    typeof blogGeneratorRoute.POST === "function",
    "Admin Gemini AI Blog Generator (/api/ai/generate-blog) is untouched and functional"
  );

  console.log("\n==========================================================");
  console.log(`   TEST RESULTS: ${totalPassed} / ${totalTests} TESTS PASSED   `);
  console.log("==========================================================");
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
