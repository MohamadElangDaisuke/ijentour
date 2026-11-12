import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get("featured") === "true";
    const all = searchParams.get("all") === "true"; // For admin to see inactive too

    const where: any = {};
    if (!all) {
      where.isActive = true;
    }
    if (featuredOnly) {
      where.isFeatured = true;
    }

    const staff = await prisma.staff.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    console.warn("GET /api/staff fallback used:", error?.message || error);
    return NextResponse.json({ success: true, staff: [] });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Please login as an administrator." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      role = "Tour Guide",
      specialty,
      description,
      avatarUrl,
      experience = "5+ Years",
      languages = "English, Indonesian",
      rating = 5.0,
      badge = "HPI Licensed",
      phone,
      email,
      instagram,
      isFeatured = true,
      isActive = true,
      sortOrder = 0,
      userId,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Staff name is required." },
        { status: 400 }
      );
    }

    const newStaff = await prisma.staff.create({
      data: {
        name: name.trim(),
        role: role.trim() || "Tour Guide",
        specialty: specialty?.trim() || null,
        description: description?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        experience: experience?.trim() || "5+ Years",
        languages: languages?.trim() || "English, Indonesian",
        rating: Number(rating) || 5.0,
        badge: badge?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        instagram: instagram?.trim() || null,
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
        sortOrder: Number(sortOrder) || 0,
        userId: userId || null,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/about");
    } catch {}

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error: any) {
    console.error("POST /api/staff error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add staff member." },
      { status: 500 }
    );
  }
}
