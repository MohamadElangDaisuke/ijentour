import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createInternalNotification } from "@/lib/notifications";
import { contactRateLimiter, getClientIp } from "@/lib/rateLimit";
import { sendContactEmailNotification } from "@/lib/email/notifications";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

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
    const clientIp = getClientIp(request);
    if (contactRateLimiter.isLimited(clientIp)) {
      return NextResponse.json(
        {
          error: "Too many messages sent. Please wait a few minutes before submitting another inquiry.",
        },
        { status: 429 }
      );
    }

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

    // Alert admin about new inquiry safely via internal helper
    await createInternalNotification({
      type: "contact",
      title: "New Contact Message",
      description: `New message from ${contact.name} (${contact.subject})`,
      link: "/admin/contacts",
      referenceId: contact.id,
    });

    // Dispatch Contact Email Notification via Resend (Strictly Non-Blocking)
    sendContactEmailNotification({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
    }).catch((err) => console.error("[Contacts] Non-fatal contact email dispatch error:", err));

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
