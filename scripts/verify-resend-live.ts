import "dotenv/config";
import { Resend } from "resend";
import readline from "readline";
import { sendEmail } from "../lib/email/resend";
import { createTestEmail } from "../lib/email/templates";

async function promptSecret(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main() {
  console.log("=================================================================");
  console.log("     MOUNT IJEN TOUR - LIVE RESEND INTEGRATION VERIFIER         ");
  console.log("=================================================================\n");

  let apiKey = (process.env.RESEND_API_KEY || "").trim();

  // 1. Check if API key is in .env
  if (!apiKey) {
    console.log("⚠️  [NOTICE] RESEND_API_KEY is currently empty in your local .env file.");
    console.log("   You can configure it directly in: c:\\magang\\ijen-tour-fullstack\\.env");
    console.log("   Format: RESEND_API_KEY=\"re_xxxxxxxxxxxxxxxxxxxx\"\n");

    const inputKey = await promptSecret("Or paste your Resend API Key here (input will not be logged): ");
    if (inputKey && inputKey.startsWith("re_")) {
      apiKey = inputKey.trim();
      process.env.RESEND_API_KEY = apiKey;
    } else {
      console.error("\n❌ [HALTED] No valid Resend API Key provided.");
      console.error("   Please open c:\\magang\\ijen-tour-fullstack\\.env and set RESEND_API_KEY=\"re_...\"");
      process.exit(1);
    }
  }

  // 2. Validate Key format without printing secret
  const maskedKey = `${apiKey.substring(0, 5)}••••••••${apiKey.substring(apiKey.length - 4)}`;
  console.log(`🔑 API Key Detected: ${maskedKey} (Length: ${apiKey.length} chars)`);

  const sender = process.env.EMAIL_FROM || "Mount Ijen Tour <noreply@mountijentour.com>";
  const recipient = (process.env.ADMIN_NOTIFICATION_EMAIL || "elangdaisuke544@gmail.com").trim();

  console.log(`📤 Configured Sender: ${sender}`);
  console.log(`📥 Test Recipient:   ${recipient}\n`);

  // 3. Verify Domain with Resend SDK
  console.log("[1/3] Contacting Resend API to verify domain status...");
  const resend = new Resend(apiKey);

  try {
    const domainsRes = await resend.domains.list();
    if (domainsRes.error) {
      console.error("❌ Resend API Error listing domains:", domainsRes.error.message || domainsRes.error);
    } else if (domainsRes.data && Array.isArray(domainsRes.data.data)) {
      const domains = domainsRes.data.data;
      console.log(`✅ Retrieved ${domains.length} domain(s) from Resend account:`);
      for (const d of domains) {
        console.log(`   - Domain: ${d.name} | Status: ${d.status} | Region: ${d.region || "default"}`);
      }
    }
  } catch (err: any) {
    console.warn("⚠️  Could not list domains via API:", err.message || err);
  }

  // 4. Send Real Test Email (allowSimulation: false strictly enforces real delivery)
  console.log("\n[2/3] Dispatching live test email to recipient...");
  const testTpl = createTestEmail({
    recipient,
    sender,
    adminName: "Elang Daisuke (Project Owner)",
  });

  const sendResult = await sendEmail({
    to: recipient,
    subject: `[Mount Ijen Tour] Live Production Verification - ${new Date().toISOString()}`,
    html: testTpl.html,
    text: testTpl.text,
    allowSimulation: false,
    tags: [{ name: "test_verification", value: "live_check" }],
  });

  // 5. Check and Report Result
  console.log("\n[3/3] Analyzing delivery response...");
  if (!sendResult.success) {
    console.error("❌ Live Email Dispatch FAILED:");
    console.error(`   Error message: ${sendResult.error}`);
    console.error("\nTroubleshooting tips:");
    console.error(" - Check if the API key has 'Sending Access' or 'Full Access' permissions.");
    console.error(" - Confirm the sender domain 'mountijentour.com' is in status 'Verified' on Resend.");
    process.exit(1);
  }

  if (sendResult.mocked) {
    console.error("❌ Unexpected: Email was simulated, not sent through the real API.");
    process.exit(1);
  }

  console.log("=================================================================");
  console.log("🎉 LIVE EMAIL DISPATCH SUCCESSFUL!");
  console.log("=================================================================");
  console.log(`📧 Resend Email ID: ${sendResult.id}`);
  console.log(`📬 Delivered To:     ${recipient}`);
  console.log(`🕒 Timestamp:        ${new Date().toISOString()}`);
  console.log("-----------------------------------------------------------------");
  console.log("NEXT STEP FOR PROJECT OWNER:");
  console.log(`Please check the inbox and Spam/Junk folder of ${recipient}.`);
  console.log("Also check the Resend Dashboard (https://resend.com/emails) to verify");
  console.log("that the email is recorded as 'Delivered'.");
  console.log("=================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

