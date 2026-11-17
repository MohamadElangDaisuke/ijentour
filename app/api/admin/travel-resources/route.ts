import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  serializeTravelResource,
  travelResourceCreateSchema,
} from "@/lib/travel-resources-validation";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";
    const category = searchParams.get("category")?.trim() || "";

    const where: Record<string, unknown> = {};

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.travelResource.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: rows.map(serializeTravelResource),
    });
  } catch (error) {
    console.error("[GET /api/admin/travel-resources] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch travel resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = travelResourceCreateSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message || "Invalid input data",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.travelResource.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A travel resource with slug "${data.slug}" already exists.`,
        },
        { status: 409 }
      );
    }

    const created = await prisma.travelResource.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        icon: data.icon,
        link: data.link ?? null,
        items: JSON.stringify(data.items ?? []),
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        data: serializeTravelResource(created),
        message: "Travel resource created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/travel-resources] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create travel resource" },
      { status: 500 }
    );
  }
}

