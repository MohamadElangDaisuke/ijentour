import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        tripPackage: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to load reservation details." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const body = await request.json();
    if (existing.bookingType === "CUSTOM" && body.finalPrice !== undefined) {
      return NextResponse.json(
        { error: "Custom trip quotes are handled manually outside the application." },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (body.status !== undefined) {
      dataToUpdate.status = body.status;
      if (body.status === "CONFIRMED") dataToUpdate.confirmedAt = new Date();
      if (body.status === "CANCELLED") dataToUpdate.cancelledAt = new Date();
    }
    if (body.finalPrice !== undefined && body.finalPrice !== null) {
      dataToUpdate.finalPrice = Number(body.finalPrice);
      dataToUpdate.totalPrice = Number(body.finalPrice);
    }
    if (body.adminNotes !== undefined) dataToUpdate.adminNotes = body.adminNotes;
    if (body.paymentStatus !== undefined) dataToUpdate.paymentStatus = body.paymentStatus;
    if (body.specialRequests !== undefined) dataToUpdate.specialRequests = body.specialRequests;
    if (body.pickupLocation !== undefined) dataToUpdate.pickupLocation = body.pickupLocation;

    const updated = await prisma.booking.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/admin/bookings");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Reservation status updated successfully.",
      booking: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update reservation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please login as an administrator." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found or already deleted." }, { status: 404 });
    }

    await prisma.booking.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, message: "Reservation successfully deleted." });
  } catch (error: any) {
    console.error("DELETE /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete reservation." },
      { status: 500 }
    );
  }
}
