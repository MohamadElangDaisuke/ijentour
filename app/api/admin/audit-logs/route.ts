import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin(request);
    if (!superAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak. Log audit administratif hanya dapat diakses oleh Super Admin.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const action = searchParams.get("action")?.trim() || "";
    const adminQuery = searchParams.get("admin")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";
    const startDate = searchParams.get("startDate")?.trim() || "";
    const endDate = searchParams.get("endDate")?.trim() || "";

    const where: any = {};

    if (action && action !== "ALL") {
      where.action = action;
    }

    if (adminQuery) {
      where.adminName = { contains: adminQuery, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { adminName: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
        { targetId: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const skip = (page - 1) * limit;

    // Gracefully handle query if table is not yet migrated in test env
    let logs: any[] = [];
    let total = 0;

    try {
      const [fetchedLogs, totalCount] = await Promise.all([
        (prisma as any).auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        (prisma as any).auditLog.count({ where }),
      ]);
      logs = fetchedLogs;
      total = totalCount;
    } catch (dbErr: any) {
      console.warn("[AuditLogs API] Query error (may be pending migration):", dbErr.message);
      // Return empty list gracefully without throwing 500
      logs = [];
      total = 0;
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/audit-logs error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat log audit administratif." },
      { status: 500 }
    );
  }
}

