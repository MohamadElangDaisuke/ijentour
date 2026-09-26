import { NextResponse } from "next/server";
import { prisma, safeJsonParse } from "@/lib/prisma";
import { generateBookingCode } from "@/lib/utils";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, phone: true },
        },
        tripPackage: {
          select: { id: true, title: true, price: true, coverImage: true },
        },
      },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Gagal memuat data reservasi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tripPackageId,
      packageName,
      customerName,
      customerEmail,
      customerPhone,
      whatsappNumber,
      departureDate,
      numParticipants = 1,
      basePrice = 750000,
      addons = [],
      specialRequests = "",
      pickupLocation = "Banyuwangi",
    } = body;

    if (!customerName || !whatsappNumber || !packageName) {
      return NextResponse.json(
        { error: "Nama, nomor WhatsApp, dan paket wajib diisi." },
        { status: 400 }
      );
    }

    // Check if user is logged in
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let userId: string | null = null;
    let isCustomerPro = false;

    if (token) {
      const session = await verifyAuthToken(token);
      if (session) {
        userId = session.userId;
        if (session.role === "CUSTOMER_PRO") {
          isCustomerPro = true;
        }
      }
    }

    // Calculate Addon Total
    const addonList = Array.isArray(addons) ? addons : [];
    const addonTotal = addonList.reduce((sum: number, a: any) => sum + (Number(a.price) || 0), 0);

    // Calculate Base Subtotal
    const subtotal = Number(basePrice) * Number(numParticipants);

    // Pro Member Perk: 10% exclusive discount
    let discountAmount = 0;
    if (isCustomerPro) {
      discountAmount = Math.round(subtotal * 0.1);
    }

    const totalPrice = subtotal + addonTotal - discountAmount;
    const bookingCode = generateBookingCode();

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        userId: userId || null,
        tripPackageId: tripPackageId || null,
        packageName,
        customerName: customerName.trim(),
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || whatsappNumber,
        whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ""),
        departureDate: departureDate || new Date().toISOString().split("T")[0],
        numParticipants: Number(numParticipants),
        basePrice: Number(basePrice),
        addons: JSON.stringify(addonList),
        addonTotal,
        discountAmount,
        totalPrice,
        specialRequests: specialRequests || null,
        pickupLocation: pickupLocation || null,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    // Notify Administrator in database
    await prisma.notification.create({
      data: {
        type: "booking",
        title: "Reservasi Baru Masuk",
        description: `${customerName} memesan '${packageName}' (${numParticipants} pax). Kode: ${bookingCode}`,
        link: "/admin/bookings",
        unread: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reservasi berhasil dibuat!",
      bookingCode,
      booking,
    });
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses pemesanan." },
      { status: 500 }
    );
  }
}
