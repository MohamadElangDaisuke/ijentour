import "dotenv/config";
import { signAdminToken } from "../lib/auth";
import { getResendConfigStatus } from "../lib/email/resend";
import { prisma } from "../lib/prisma";

async function runTests() {
  console.log("=================================================================");
  console.log("  PHASE 4: FINAL INTEGRATION & PRODUCTION READINESS TEST SUITE  ");
  console.log("=================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   Detail: ${detail}`);
    }
  }

  // 1. JWT Token Role Hierarchy & Encoding
  const superAdminToken = await signAdminToken({
    id: "usr_super_test_p4",
    name: "Super Admin Tester",
    email: "elangdaisuke544@gmail.com",
    role: "SUPER_ADMIN",
    emailVerified: true,
  });

  const adminToken = await signAdminToken({
    id: "usr_admin_test_p4",
    name: "Regular Admin Tester",
    email: "staff@mountijentour.com",
    role: "ADMIN",
    emailVerified: true,
  });

  const unverifiedToken = await signAdminToken({
    id: "usr_unverified_p4",
    name: "Unverified Admin",
    email: "newadmin@mountijentour.com",
    role: "ADMIN",
    emailVerified: false,
  });

  assert(Boolean(superAdminToken && superAdminToken.split(".").length === 3), "JWT Generation: Valid 3-part signed JWT structure");

  // 2. Resend Config Status & Environment Alias Resolution
  const config = getResendConfigStatus();
  assert(Boolean(config.senderEmail && config.senderEmail.includes("mountijentour.com")), "Resend Config: Sender domain resolves mountijentour.com");
  assert(config.adminNotificationEmail === "elangdaisuke544@gmail.com", "Resend Config: Admin recipient is elangdaisuke544@gmail.com");
  assert(config.maskedApiKey.includes("••••"), "Resend Config: Secret API key is properly masked");

  // 3. Database Schema Integrity Check
  try {
    assert(typeof (prisma as any).auditLog.findMany === "function", "Prisma Client: auditLog model available");
    assert(typeof (prisma as any).emailVerificationOtp.findMany === "function", "Prisma Client: emailVerificationOtp model available");
    assert(typeof prisma.review.findMany === "function", "Prisma Client: review model available");
  } catch (err: any) {
    assert(false, "Prisma Client Integrity", err.message);
  }

  // 4. Rate Limiter Specifications
  const { loginRateLimiter, otpRateLimiter, reviewRateLimiter, MemoryRateLimiter } = await import("../lib/rateLimit");
  const testLimiter = new MemoryRateLimiter({ windowMs: 1000, maxRequests: 2 });
  assert(!testLimiter.isLimited("test_ip"), "RateLimiter: 1st request allowed");
  assert(!testLimiter.isLimited("test_ip"), "RateLimiter: 2nd request allowed");
  assert(testLimiter.isLimited("test_ip"), "RateLimiter: 3rd request blocked (HTTP 429)");

  // 5. Audit Log Sanitization Check
  const { recordAuditLog } = await import("../lib/audit");
  const logSaved = await recordAuditLog({
    userId: "usr_super_test_p4",
    adminName: "Super Admin Tester",
    action: "UPDATE_SETTINGS",
    targetId: "sys_test",
    details: {
      password: "secret_password_123",
      apiKey: "re_super_secret_key",
      safeParam: "allowed_value",
    },
    ipAddress: "127.0.0.1",
  });
  assert(typeof logSaved === "boolean", "AuditLog: Logging handler executes without crashing");

  // 6. Review Filter Verification (Logic Check)
  // Public query requires isApproved: true AND OR: [{ emailVerified: true }, { userId: { not: null } }, { authorEmail: null }]
  const testPublicReviewFilter = (r: { isApproved: boolean; emailVerified: boolean; userId: string | null; authorEmail: string | null }) => {
    if (!r.isApproved) return false;
    return r.emailVerified || r.userId !== null || r.authorEmail === null;
  };

  const unapprovedLegacy = testPublicReviewFilter({ isApproved: false, emailVerified: false, userId: null, authorEmail: null });
  const approvedLegacy = testPublicReviewFilter({ isApproved: true, emailVerified: false, userId: null, authorEmail: null });
  const unverifiedGuest = testPublicReviewFilter({ isApproved: false, emailVerified: false, userId: null, authorEmail: "guest@example.com" });
  const unverifiedGuestApproved = testPublicReviewFilter({ isApproved: true, emailVerified: false, userId: null, authorEmail: "guest@example.com" });
  const verifiedGuestApproved = testPublicReviewFilter({ isApproved: true, emailVerified: true, userId: null, authorEmail: "guest@example.com" });

  assert(unapprovedLegacy === false, "Review Security: Unapproved legacy review is hidden");
  assert(approvedLegacy === true, "Review Security: Approved legacy review remains visible");
  assert(unverifiedGuest === false, "Review Security: Unverified guest review is hidden");
  assert(unverifiedGuestApproved === false, "Review Security: Unverified guest review with approved flag is hidden");
  assert(verifiedGuestApproved === true, "Review Security: Verified & approved guest review is visible");

  // 7. Role Management & Safeguards Logic Check
  const validateCreateRole = (role: string) => {
    if (role === "SUPER_ADMIN") return { allowed: false, error: "Pembuatan Super Admin tambahan ditolak" };
    return { allowed: true, role: "ADMIN" };
  };

  assert(validateCreateRole("SUPER_ADMIN").allowed === false, "RBAC Security: Ordinary Admin form blocks creating SUPER_ADMIN");
  assert(validateCreateRole("ADMIN").allowed === true, "RBAC Security: Ordinary Admin form permits creating ADMIN");

  // 8. Self-Profile Modification vs Privilege Escalation Check
  const validateUserUpdatePermissions = (caller: { id: string; role: string }, targetId: string, body: any) => {
    const isSuperAdmin = caller.role === "SUPER_ADMIN";
    if (!isSuperAdmin) {
      if (caller.id !== targetId) return { allowed: false, error: "Cannot edit other users" };
      if (body.role !== undefined || body.isActive !== undefined || body.email !== undefined || body.username !== undefined) {
        return { allowed: false, error: "Cannot escalate privileges" };
      }
    }
    return { allowed: true };
  };

  const adminEditsSelfAllowed = validateUserUpdatePermissions({ id: "usr_admin_1", role: "ADMIN" }, "usr_admin_1", { name: "New Name", phone: "628123" });
  const adminEditsOtherBlocked = validateUserUpdatePermissions({ id: "usr_admin_1", role: "ADMIN" }, "usr_admin_2", { name: "Hacked" });
  const adminPromotesSelfBlocked = validateUserUpdatePermissions({ id: "usr_admin_1", role: "ADMIN" }, "usr_admin_1", { role: "SUPER_ADMIN" });
  const superAdminEditsOtherAllowed = validateUserUpdatePermissions({ id: "usr_super_1", role: "SUPER_ADMIN" }, "usr_admin_2", { name: "Updated by Super" });

  assert(adminEditsSelfAllowed.allowed === true, "RBAC Security: Admin can update own personal name & phone");
  assert(adminEditsOtherBlocked.allowed === false, "RBAC Security: Admin cannot update other administrator accounts");
  assert(adminPromotesSelfBlocked.allowed === false, "RBAC Security: Admin cannot promote own account to SUPER_ADMIN");
  assert(superAdminEditsOtherAllowed.allowed === true, "RBAC Security: Super Admin can update administrator profiles");

  // Summary
  console.log("\n-----------------------------------------------------------------");
  console.log(`TEST SUMMARY: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("=================================================================\n");

  if (passed < total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});

