import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
        time: new Date(n.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Gagal memuat notifikasi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
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
    return NextResponse.json({ error: "Gagal memperbarui notifikasi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, link = "/admin/notifications", type = "booking" } = await request.json();
    if (!title || !description) {
      return NextResponse.json({ error: "Judul dan deskripsi notifikasi wajib diisi." }, { status: 400 });
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
    return NextResponse.json({ error: "Gagal membuat notifikasi." }, { status: 500 });
  }
}
