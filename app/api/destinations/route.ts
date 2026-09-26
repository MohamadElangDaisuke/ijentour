import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultDestinations } from "@/app/lib/destinationsStorage";

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { sortOrder: "asc" },
    });

    if (destinations.length === 0) {
      return NextResponse.json({ success: true, destinations: defaultDestinations });
    }

    return NextResponse.json({ success: true, destinations });
  } catch (error) {
    console.error("GET /api/destinations error:", error);
    return NextResponse.json({ success: true, destinations: defaultDestinations });
  }
}
