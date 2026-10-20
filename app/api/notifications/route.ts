import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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
    const { title, description, link = "/admin/notifications", type = "booking" } = await request.json();
    if (!title || !description) {
      return NextResponse.json({ error: "Notification title and description are required." }, { status: 400 });
    }

    const notif = await prisma.notification.create({
      data: {
        title,
        description,
        link,
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
