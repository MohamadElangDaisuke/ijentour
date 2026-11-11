import { prisma } from "@/lib/prisma";

export interface CreateAuditLogParams {
  userId?: string | null;
  adminName?: string | null;
  action:
    | "CREATE_ADMIN"
    | "UPDATE_ADMIN"
    | "DEACTIVATE_ADMIN"
    | "ACTIVATE_ADMIN"
    | "DELETE_ADMIN"
    | "PASSWORD_RESET"
    | "AUTH_FAILURE"
    | "UPDATE_SETTINGS"
    | "SYSTEM_CONFIG";
  targetId?: string | null;
  details?: Record<string, any> | string;
  ipAddress?: string | null;
}

/**
 * Filter out sensitive fields before recording audit logs
 */
function sanitizeAuditDetails(details?: Record<string, any> | string): string | null {
  if (!details) return null;
  if (typeof details === "string") return details.slice(0, 1000);

  const clean = { ...details };
  const sensitiveKeys = [
    "password",
    "passwordHash",
    "otp",
    "otpHash",
    "token",
    "secret",
    "key",
  ];

  for (const k of Object.keys(clean)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      clean[k] = "[REDACTED]";
    }
  }

  return JSON.stringify(clean).slice(0, 1000);
}

/**
 * Record a security or administrative audit event.
 * Non-blocking: Failures will log an internal warning without breaking callers.
 */
export async function recordAuditLog(params: CreateAuditLogParams): Promise<boolean> {
  try {
    const { userId, adminName, action, targetId, details, ipAddress } = params;

    await (prisma as any).auditLog.create({
      data: {
        userId: userId || null,
        adminName: adminName ? String(adminName).slice(0, 150) : null,
        action,
        targetId: targetId ? String(targetId).slice(0, 100) : null,
        details: sanitizeAuditDetails(details),
        ipAddress: ipAddress ? String(ipAddress).slice(0, 45) : null,
      },
    });

    return true;
  } catch (error) {
    // Non-fatal: do not crash if audit log table is pending migration or connection issue
    console.warn("Non-fatal: Failed to record audit log:", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}

