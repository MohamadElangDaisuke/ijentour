import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  serializeTravelResource,
  travelResourceUpdateSchema,
} from "@/lib/travel-resources-validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const item = await prisma.travelResource.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Travel resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeTravelResource(item),
    });
  } catch (error) {
    console.error("[GET /api/admin/travel-resources/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load travel resource" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await prisma.travelResource.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Travel resource not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = travelResourceUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message || "Invalid update payload",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await prisma.travelResource.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            error: `A travel resource with slug "${data.slug}" already exists.`,
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.travelResource.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.link !== undefined && { link: data.link }),
        ...(data.items !== undefined && { items: JSON.stringify(data.items) }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: serializeTravelResource(updated),
      message: "Travel resource updated successfully.",
    });
  } catch (error) {
    console.error("[PATCH /api/admin/travel-resources/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update travel resource" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await prisma.travelResource.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Travel resource not found." },
        { status: 404 }
      );
    }

    await prisma.travelResource.delete({ where: { id } });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Travel resource deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/travel-resources/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete travel resource" },
      { status: 500 }
    );
  }
}

