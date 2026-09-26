import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, contacts });
  } catch (error) {
    console.error("GET /api/contacts error:", error);
    return NextResponse.json({ error: "Gagal memuat pesan kontak." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nama, email, dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone || null,
        subject: subject || "Pertanyaan Perjalanan",
        message: message.trim(),
        status: "UNREAD",
      },
    });

    // Alert admin about new inquiry
    await prisma.notification.create({
      data: {
        type: "contact",
        title: "Pesan Kontak Baru",
        description: `Pesan baru dari ${contact.name} (${contact.subject})`,
        link: "/admin/contacts",
        unread: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Pesan Anda telah kami terima dan akan segera kami balas.",
      contact,
    });
  } catch (error: any) {
    console.error("POST /api/contacts error:", error);
    return NextResponse.json(
      { error: "Gagal mengirimkan pesan." },
      { status: 500 }
    );
  }
}
