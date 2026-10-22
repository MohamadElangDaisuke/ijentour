import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBookingCode } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";
import { ADDON_OPTIONS, DURATION_OPTIONS, GUIDE_OPTIONS, TRANSPORT_OPTIONS } from "@/lib/customTour";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const bookingType = searchParams.get("type");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }
    if (bookingType && bookingType !== "ALL") {
      where.bookingType = bookingType;
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
    return NextResponse.json({ error: "Failed to load reservation data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingType = "REGULAR",
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
      // Custom Tour Specific Fields
      destinations = [],
      durationId = "",
      transportId = "",
      guideId = "",
      addonIds = [],
    } = body;

    if (!customerName || !whatsappNumber) {
      return NextResponse.json(
        { error: "Customer name and WhatsApp number are required." },
        { status: 400 }
      );
    }

    const sanitizedWhatsApp = whatsappNumber.replace(/[^0-9]/g, "");
    if (sanitizedWhatsApp.length < 8) {
      return NextResponse.json(
        { error: "Please enter a valid WhatsApp number (at least 8 digits)." },
        { status: 400 }
      );
    }

    const bookingCode = generateBookingCode();
    const pax = Math.max(1, Math.min(50, Number(numParticipants) || 1));
    const validDepartureDate = departureDate || new Date().toISOString().split("T")[0];

    // ==========================================
    // 1. HANDLE CUSTOM TOUR PACKAGE REQUEST
    // ==========================================
    if (bookingType === "CUSTOM") {
      if (!Array.isArray(destinations) || destinations.length === 0) {
        return NextResponse.json(
          { error: "Please select at least 1 destination for your custom trip." },
          { status: 400 }
        );
      }

      // Re-verify destinations against database to ensure legitimacy
      const destIds = destinations.map((d: any) => d.id).filter(Boolean);
      const dbDestinations = await prisma.destination.findMany({
        where: { id: { in: destIds } },
        select: { id: true, name: true, slug: true },
      });

      // Construct verified destination list (using DB records or valid fallback)
      const verifiedDestinations = destinations.map((d: any) => {
        const found = dbDestinations.find((dbD) => dbD.id === d.id);
        return {
          id: d.id,
          name: found ? found.name : d.name,
          slug: found ? found.slug : d.slug,
        };
      });

      const selectedAddonIds = Array.isArray(addonIds) ? addonIds : [];
      const addonsList = ADDON_OPTIONS.filter((addon) => selectedAddonIds.includes(addon.id)).map(
        (addon) => ({ id: addon.id, name: addon.name })
      );

      const customTripTitle = `Custom Trip: ${verifiedDestinations.map((d) => d.name).join(" + ")}`;

      const customSnapshot = {
        isCustom: true,
        destinations: verifiedDestinations,
        durationId,
        durationName: DURATION_OPTIONS.find((duration) => duration.id === durationId)?.name ?? null,
        transportId,
        transportName:
          TRANSPORT_OPTIONS.find((transport) => transport.id === transportId)?.name ?? null,
        guideId,
        guideName: GUIDE_OPTIONS.find((guide) => guide.id === guideId)?.name ?? null,
        addonIds: selectedAddonIds,
        addonsList,
        requiresAdminReview: true,
      };

      const booking = await prisma.booking.create({
        data: {
          bookingCode,
          bookingType: "CUSTOM",
          tripPackageId: null,
          packageName: customTripTitle,
          customerName: customerName.trim(),
          customerEmail: customerEmail ? customerEmail.trim() : null,
          customerPhone: customerPhone || sanitizedWhatsApp,
          whatsappNumber: sanitizedWhatsApp,
          departureDate: validDepartureDate,
          numParticipants: pax,
          basePrice: 0,
          addons: JSON.stringify(addonsList),
          addonTotal: 0,
          discountAmount: 0,
          totalPrice: 0,
          estimatedPrice: 0,
          finalPrice: null, // Admin must review and approve
          customDetails: JSON.stringify(customSnapshot),
          specialRequests: specialRequests ? specialRequests.trim() : null,
          pickupLocation: pickupLocation ? pickupLocation.trim() : "Banyuwangi Area",
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      // Notify Admin
      await prisma.notification.create({
        data: {
          type: "booking",
          title: "New Custom Trip Request",
          description: `${customerName.trim()} requested a custom trip: ${verifiedDestinations.map((d) => d.name).join(", ")} (${pax} pax). A travel agent will prepare the proposal manually.`,
          link: "/admin/bookings",
          unread: true,
        },
      });

      try {
        revalidatePath("/admin/bookings");
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Custom trip request successfully submitted! Our expedition coordinator will review and confirm your schedule.",
        bookingCode,
        booking,
      });
    }

    // ==========================================
    // 2. HANDLE REGULAR TOUR PACKAGE RESERVATION
    // ==========================================
    if (!packageName) {
      return NextResponse.json(
        { error: "Tour package name is required for regular booking." },
        { status: 400 }
      );
    }

    const addonList = Array.isArray(addons) ? addons : [];
    const addonTotal = addonList.reduce((sum: number, a: any) => sum + (Number(a.price) || 0), 0);
    const subtotal = Number(basePrice) * pax;
    const discountAmount = 0;
    const totalPrice = subtotal + addonTotal - discountAmount;

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        bookingType: "REGULAR",
        userId: null,
        tripPackageId: tripPackageId || null,
        packageName,
        customerName: customerName.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        customerPhone: customerPhone || sanitizedWhatsApp,
        whatsappNumber: sanitizedWhatsApp,
        departureDate: validDepartureDate,
        numParticipants: pax,
        basePrice: Number(basePrice),
        addons: JSON.stringify(addonList),
        addonTotal,
        discountAmount,
        totalPrice,
        estimatedPrice: totalPrice,
        finalPrice: totalPrice,
        specialRequests: specialRequests ? specialRequests.trim() : null,
        pickupLocation: pickupLocation ? pickupLocation.trim() : "Banyuwangi",
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    // Notify Administrator in database
    await prisma.notification.create({
      data: {
        type: "booking",
        title: "New Reservation Received",
        description: `${customerName.trim()} booked '${packageName}' (${pax} pax). Code: ${bookingCode}`,
        link: "/admin/bookings",
        unread: true,
      },
    });

    try {
      revalidatePath("/admin/bookings");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Reservation successfully created!",
      bookingCode,
      booking,
    });
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process booking." },
      { status: 500 }
    );
  }
}
