import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";
import * as bcrypt from "bcryptjs";
import { sendSecurityAlertEmail } from "@/lib/email/notifications";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await requireAdmin(request);
    if (!caller) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Please sign in first as an administrator.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const clientIp = getClientIp(request);
    const isSuperAdmin = caller.role === "SUPER_ADMIN";

    // Rule: Ordinary ADMIN can ONLY update their own personal profile (name, phone, password)
    if (!isSuperAdmin) {
      if (caller.id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied. Standard administrators can only update their own account profile and password.",
          },
          { status: 403 }
        );
      }

      if (
        bodyHasRestrictedFields(await request.clone().json().catch(() => ({})))
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied. Standard administrators are not permitted to modify role, account status, username, email, or system preferences.",
          },
          { status: 403 }
        );
      }
    }

    const existing = await (prisma as any).user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Administrator account not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const dataToUpdate: any = {};
    const auditEvents: string[] = [];

    // 1. Name
    if (body.name !== undefined) {
      dataToUpdate.name = String(body.name).trim();
    }

    // 2. Phone
    if (body.phone !== undefined) {
      dataToUpdate.phone = String(body.phone).trim();
    }

    // 3. Username change (Super Admin Only)
    if (body.username !== undefined) {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { success: false, error: "Only Super Admins are authorized to change usernames." },
          { status: 403 }
        );
      }
      const cleanUsername = String(body.username).trim().toLowerCase();
      if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
        return NextResponse.json(
          {
            success: false,
            error: "Username may only contain lowercase letters, numbers, underscores (_), and must be 3-30 characters long.",
          },
          { status: 400 }
        );
      }

      if (cleanUsername !== existing.username) {
        const usernameTaken = await (prisma as any).user.findFirst({
          where: {
            username: cleanUsername,
            id: { not: id },
          },
        });
        if (usernameTaken) {
          return NextResponse.json(
            { success: false, error: `Username '${cleanUsername}' is already used by another account.` },
            { status: 400 }
          );
        }
        dataToUpdate.username = cleanUsername;
        auditEvents.push(`username_change_to_${cleanUsername}`);
      }
    }

    // 4. Email change (Super Admin Only)
    if (body.email !== undefined) {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { success: false, error: "Only Super Admins are authorized to change administrator email addresses." },
          { status: 403 }
        );
      }
      const cleanEmail = String(body.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: "Invalid email address format." },
          { status: 400 }
        );
      }

      if (cleanEmail !== existing.email) {
        const emailTaken = await (prisma as any).user.findFirst({
          where: {
            email: cleanEmail,
            id: { not: id },
          },
        });
        if (emailTaken) {
          return NextResponse.json(
            { success: false, error: `Email '${cleanEmail}' is already used by another account.` },
            { status: 400 }
          );
        }
        dataToUpdate.email = cleanEmail;
        dataToUpdate.emailVerified = null; // Re-verification required when email changes
        auditEvents.push(`email_change_to_${cleanEmail}`);
      }
    }

    // 5. Role change & Safeguards (Super Admin Only)
    if (body.role !== undefined && body.role !== existing.role) {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { success: false, error: "Access denied. Standard administrators cannot change account roles." },
          { status: 403 }
        );
      }

      const targetRole = body.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";

      // Super Admin cannot demote themselves
      if (caller.id === id && targetRole !== "SUPER_ADMIN") {
        return NextResponse.json(
          { success: false, error: "You cannot demote Super Admin privileges on your own account." },
          { status: 400 }
        );
      }

      // Safeguard: Check if target is the last active Super Admin
      if (existing.role === "SUPER_ADMIN" && targetRole !== "SUPER_ADMIN") {
        const activeSuperAdmins = await (prisma as any).user.count({
          where: { role: "SUPER_ADMIN", isActive: true },
        });
        if (activeSuperAdmins <= 1) {
          return NextResponse.json(
            { success: false, error: "Cannot change the role of the last active Super Admin in the system." },
            { status: 400 }
          );
        }
      }

      dataToUpdate.role = targetRole;
      auditEvents.push(`role_change_from_${existing.role}_to_${targetRole}`);
    }

    // 6. Active status & Safeguards (Super Admin Only)
    if (body.isActive !== undefined) {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { success: false, error: "Access denied. Standard administrators cannot change account active status." },
          { status: 403 }
        );
      }

      const nextActive = Boolean(body.isActive);

      if (caller.id === id && !nextActive) {
        return NextResponse.json(
          { success: false, error: "You cannot deactivate your own Super Admin account." },
          { status: 400 }
        );
      }

      // Safeguard: Cannot deactivate last Super Admin
      if (existing.role === "SUPER_ADMIN" && !nextActive) {
        const activeSuperAdmins = await (prisma as any).user.count({
          where: { role: "SUPER_ADMIN", isActive: true },
        });
        if (activeSuperAdmins <= 1) {
          return NextResponse.json(
            { success: false, error: "Cannot deactivate the last active Super Admin account in the system." },
            { status: 400 }
          );
        }
      }

      dataToUpdate.isActive = nextActive;
      if (nextActive !== existing.isActive) {
        auditEvents.push(nextActive ? "account_activated" : "account_deactivated");
      }
    }

    // 7. Notification preferences (Super Admin Only)
    if (body.notificationPreferences !== undefined) {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { success: false, error: "Access denied. System notification preferences can only be changed by a Super Admin." },
          { status: 403 }
        );
      }
      dataToUpdate.notificationPreferences =
        typeof body.notificationPreferences === "string"
          ? body.notificationPreferences
          : JSON.stringify(body.notificationPreferences);
    }

    // 8. Password change (Permitted for own account or Super Admin)
    if (body.password) {
      if (String(body.password).length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }
      dataToUpdate.passwordHash = await bcrypt.hash(String(body.password), 10);
      auditEvents.push("password_reset");
    }

    // Update in database
    const updated = await (prisma as any).user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        notificationPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Record audit log
    if (auditEvents.length > 0) {
      const isPasswordReset = auditEvents.includes("password_reset");
      const isDeactivate = auditEvents.includes("account_deactivated");
      const isActivate = auditEvents.includes("account_activated");

      let action: any = "UPDATE_ADMIN";
      if (isPasswordReset) action = "PASSWORD_RESET";
      else if (isDeactivate) action = "DEACTIVATE_ADMIN";
      else if (isActivate) action = "ACTIVATE_ADMIN";

      await recordAuditLog({
        userId: caller.id,
        adminName: caller.name,
        action,
        targetId: updated.id,
        details: { targetUsername: updated.username, events: auditEvents },
        ipAddress: clientIp,
      });

      // Dispatch security alert email to Super Admin (Non-blocking)
      sendSecurityAlertEmail({
        action,
        adminName: caller.name,
        details: { targetUsername: updated.username, targetEmail: updated.email, events: auditEvents },
        ipAddress: clientIp,
      }).catch((err) => console.error("[Users] Failed to dispatch security alert email:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Administrator profile updated successfully.",
      user: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update administrator account." },
      { status: 500 }
    );
  }
}

function bodyHasRestrictedFields(body: any): boolean {
  if (!body) return false;
  return (
    body.role !== undefined ||
    body.isActive !== undefined ||
    body.email !== undefined ||
    body.username !== undefined ||
    body.notificationPreferences !== undefined
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const superAdmin = await requireSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Deleting administrator accounts is only permitted for Super Admins.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const clientIp = getClientIp(request);

    // Safeguard 1: Cannot delete own account
    if (superAdmin.id === id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own Super Admin account." },
        { status: 400 }
      );
    }

    const existing = await (prisma as any).user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Administrator account not found." },
        { status: 404 }
      );
    }

    // Safeguard 2: Cannot delete the last Super Admin
    if (existing.role === "SUPER_ADMIN") {
      const totalSuperAdmins = await (prisma as any).user.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (totalSuperAdmins <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot delete the last Super Admin in the system." },
          { status: 400 }
        );
      }
    }

    // Safeguard 3: Cannot delete the last active admin
    const totalAdmins = await (prisma as any).user.count({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    });
    if (totalAdmins <= 1) {
      return NextResponse.json(
        { success: false, error: "Cannot delete the last administrator in the system." },
        { status: 400 }
      );
    }

    await (prisma as any).user.delete({ where: { id } });

    // Record audit log
    await recordAuditLog({
      userId: superAdmin.id,
      adminName: superAdmin.name,
      action: "DELETE_ADMIN",
      targetId: existing.id,
      details: { deletedUsername: existing.username, deletedEmail: existing.email, role: existing.role },
      ipAddress: clientIp,
    });

    // Dispatch security alert email to Super Admin (Non-blocking)
    sendSecurityAlertEmail({
      action: "DELETE_ADMIN",
      adminName: superAdmin.name,
      details: { deletedUsername: existing.username, deletedEmail: existing.email, role: existing.role },
      ipAddress: clientIp,
    }).catch((err) => console.error("[Users] Failed to dispatch admin deletion security alert:", err));

    return NextResponse.json({
      success: true,
      message: `Administrator account '${existing.name}' deleted successfully.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete administrator account." },
      { status: 500 }
    );
  }
}
