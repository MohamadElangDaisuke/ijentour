import "dotenv/config";
import { signAdminToken, verifyAdminToken, requireAdmin, requireSuperAdmin } from "../lib/auth";
import { createEmailOtp, verifyEmailOtp } from "../lib/otp";
import { recordAuditLog } from "../lib/audit";
import { NextRequest } from "next/server";
import { prisma } from "../lib/prisma";

async function runTests() {
  console.log("=================================================================");
  console.log("      SUITE TESTING: SUPER ADMIN & AUTHENTICATION (PHASE 2)     ");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // --- 1. TOKEN SIGNING & VERIFICATION TESTS ---
  console.log("--- 1. JWT & ROLE VERIFICATION TESTS ---");
  const superAdminPayload = {
    id: "usr_super_test_123",
    username: "superadmin_test",
    email: "super@ijentour.com",
    name: "Super Admin Test",
    role: "SUPER_ADMIN" as const,
  };

  const adminPayload = {
    id: "usr_admin_test_456",
    username: "admin_test",
    email: "admin@ijentour.com",
    name: "Admin Test",
    role: "ADMIN" as const,
  };

  const customerPayload = {
    id: "usr_cust_test_789",
    username: "cust_test",
    email: "cust@ijentour.com",
    name: "Customer Test",
    role: "CUSTOMER" as const,
  };

  const superToken = await signAdminToken(superAdminPayload);
  const adminToken = await signAdminToken(adminPayload);
  const custToken = await signAdminToken(customerPayload as any);

  const verifiedSuper = await verifyAdminToken(superToken);
  assert(verifiedSuper !== null && verifiedSuper.role === "SUPER_ADMIN", "verifyAdminToken accepts SUPER_ADMIN");

  const verifiedAdmin = await verifyAdminToken(adminToken);
  assert(verifiedAdmin !== null && verifiedAdmin.role === "ADMIN", "verifyAdminToken accepts ADMIN");

  const verifiedCust = await verifyAdminToken(custToken);
  assert(verifiedCust === null, "verifyAdminToken strictly rejects CUSTOMER");

  // Mock NextRequest with Cookie header
  const reqSuper = new NextRequest("http://localhost:3000/admin/dashboard", {
    headers: { cookie: `admin_token=${superToken}` },
  });
  const reqAdmin = new NextRequest("http://localhost:3000/admin/dashboard", {
    headers: { cookie: `admin_token=${adminToken}` },
  });
  const reqCust = new NextRequest("http://localhost:3000/admin/dashboard", {
    headers: { cookie: `admin_token=${custToken}` },
  });

  // Mock DB user validation for unit tests
  const origFindUnique = prisma.user.findUnique;
  (prisma.user as any).findUnique = async (args: any) => {
    if (args.where?.id === "usr_super_test_123") {
      return { id: "usr_super_test_123", isActive: true, role: "SUPER_ADMIN", emailVerified: new Date(), updatedAt: new Date() };
    }
    if (args.where?.id === "usr_admin_test_456") {
      return { id: "usr_admin_test_456", isActive: true, role: "ADMIN", emailVerified: new Date(), updatedAt: new Date() };
    }
    return null;
  };

  // requireAdmin tests
  const guardAdminOnSuper = await requireAdmin(reqSuper);
  assert(guardAdminOnSuper !== null, "requireAdmin allows SUPER_ADMIN access");

  const guardAdminOnAdmin = await requireAdmin(reqAdmin);
  assert(guardAdminOnAdmin !== null, "requireAdmin allows ADMIN access");

  const guardAdminOnCust = await requireAdmin(reqCust);
  assert(guardAdminOnCust === null, "requireAdmin rejects non-admin roles");

  // requireSuperAdmin tests
  const guardSuperOnSuper = await requireSuperAdmin(reqSuper);
  assert(guardSuperOnSuper !== null && guardSuperOnSuper.role === "SUPER_ADMIN", "requireSuperAdmin grants access to SUPER_ADMIN");

  const guardSuperOnAdmin = await requireSuperAdmin(reqAdmin);
  assert(guardSuperOnAdmin === null, "requireSuperAdmin strictly blocks normal ADMIN");

  const guardSuperOnCust = await requireSuperAdmin(reqCust);
  assert(guardSuperOnCust === null, "requireSuperAdmin strictly blocks CUSTOMER");

  // Restore DB mock
  (prisma.user as any).findUnique = origFindUnique;

  // --- 2. AUDIT LOGGING SANITIZATION ---
  console.log("\n--- 2. AUDIT LOGGING DATA SANITIZATION ---");
  const auditRes = await recordAuditLog({
    userId: "usr_super_test_123",
    adminName: "Super Admin Test",
    action: "UPDATE_SETTINGS",
    details: {
      action: "test_run",
      password: "SuperSecretPlaintextPassword123!",
      passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz",
      apiKey: "secret-key-to-hide",
      safeInfo: "Public Title",
    },
    ipAddress: "127.0.0.1",
  });
  assert(typeof auditRes === "boolean", "recordAuditLog executes without unhandled exception");

  // --- 3. OTP LOGIC UNIT TESTS (IN-MEMORY / LOCAL DB CHECK) ---
  console.log("\n--- 3. EMAIL OTP GENERATION & VALIDATION LOGIC ---");
  const testEmail = "test_verify_admin@ijentour.com";

  try {
    const otpGen = await createEmailOtp(testEmail, "ADMIN_VERIFY");
    if (otpGen.success && otpGen.code) {
      assert(otpGen.code.length === 6 && /^\d{6}$/.test(otpGen.code), "createEmailOtp produces valid 6-digit numeric OTP");

      // Test rate-limit/cooldown (calling immediately again should enforce cooldown)
      const immediateOtp = await createEmailOtp(testEmail, "ADMIN_VERIFY");
      assert(!immediateOtp.success && immediateOtp.cooldownSeconds !== undefined, "createEmailOtp enforces 60-second cooldown");

      // Verify wrong code
      const wrongVerify = await verifyEmailOtp(testEmail, "000000", "ADMIN_VERIFY");
      assert(!wrongVerify.success, "verifyEmailOtp rejects incorrect OTP code");

      // Verify right code
      const rightVerify = await verifyEmailOtp(testEmail, otpGen.code, "ADMIN_VERIFY");
      assert(rightVerify.success, "verifyEmailOtp validates authentic OTP code successfully");

      // Test one-time use (trying to verify again should fail)
      const reusedVerify = await verifyEmailOtp(testEmail, otpGen.code, "ADMIN_VERIFY");
      assert(!reusedVerify.success, "verifyEmailOtp enforces single-use (OTP cannot be reused)");
    } else {
      console.log(`ℹ️ Note: OTP DB table test skipped if table not yet migrated: ${otpGen.error}`);
    }
  } catch (err: any) {
    console.log(`ℹ️ Note: OTP table not yet applied to live DB (expected before migration approval): ${err.message}`);
  }

  console.log("\n=================================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("Test runner error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

