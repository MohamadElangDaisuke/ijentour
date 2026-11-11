import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sanitizeInternalLink } from "@/lib/notifications";
import { z } from "zod";

const createNotificationSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150, "Title is too long"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description is too long"),
  link: z.string().trim().optional(),
  type: z.enum(["booking", "contact", "review", "system", "user"]).default("system"),
});

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => n.unread).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        link: n.link,
        unread: n.unread,
        time: new Date(n.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({
      success: true,
      unreadCount: 0,
      notifications: [],
    });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const { id, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { unread: true },
        data: { unread: false },
      });
      return NextResponse.json({ success: true, message: "Semua notifikasi ditandai sudah dibaca." });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { unread: false },
      });
      return NextResponse.json({ success: true, message: "Notifikasi ditandai sudah dibaca." });
    }

    return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 });
  } catch (error: any) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator session required." },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
    }

    const parseResult = createNotificationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Validation error." },
        { status: 400 }
      );
    }

    const { title, description, link, type } = parseResult.data;
    const safeLink = sanitizeInternalLink(link);

    const notif = await prisma.notification.create({
      data: {
        title,
        description,
        link: safeLink,
        type,
        unread: true,
      },
    });

    return NextResponse.json({ success: true, notification: notif });
  } catch (error: any) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to create notification." }, { status: 500 });
  }
}
