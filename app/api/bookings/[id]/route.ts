import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Gagal memuat detail reservasi." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.status !== undefined) {
      dataToUpdate.status = body.status;
      if (body.status === "CONFIRMED") dataToUpdate.confirmedAt = new Date();
      if (body.status === "CANCELLED") dataToUpdate.cancelledAt = new Date();
    }
    if (body.paymentStatus !== undefined) dataToUpdate.paymentStatus = body.paymentStatus;
    if (body.specialRequests !== undefined) dataToUpdate.specialRequests = body.specialRequests;
    if (body.pickupLocation !== undefined) dataToUpdate.pickupLocation = body.pickupLocation;

    const updated = await prisma.booking.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Status reservasi berhasil diperbarui.",
      booking: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui reservasi." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }

    await prisma.booking.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, message: "Reservasi berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus reservasi." },
      { status: 500 }
    );
  }
}
