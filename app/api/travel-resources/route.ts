import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTravelResource } from "@/lib/travel-resources-validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.travelResource.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: rows.map(serializeTravelResource),
    });
  } catch (error) {
    console.error("[GET /api/travel-resources] Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load travel planning resources",
        data: [],
      },
      { status: 500 }
    );
  }
}

