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
    return NextResponse.json({ error: "Failed to load contact messages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone || null,
        subject: subject || "Travel Inquiry",
        message: message.trim(),
        status: "UNREAD",
      },
    });

    // Alert admin about new inquiry
    await prisma.notification.create({
      data: {
        type: "contact",
        title: "New Contact Message",
        description: `New message from ${contact.name} (${contact.subject})`,
        link: "/admin/contacts",
        unread: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been received and our team will get back to you shortly.",
      contact,
    });
  } catch (error: any) {
    console.error("POST /api/contacts error:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
