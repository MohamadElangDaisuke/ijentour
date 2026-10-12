import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultDestinations } from "@/app/lib/destinationsStorage";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost:5432") || process.env.DATABASE_URL.startsWith("file:")) {
      return NextResponse.json({ success: true, destinations: defaultDestinations });
    }

    const destinations = await prisma.destination.findMany({
      orderBy: { sortOrder: "asc" },
    });

    if (destinations.length === 0) {
      return NextResponse.json({ success: true, destinations: defaultDestinations });
    }

    return NextResponse.json({ success: true, destinations });
  } catch {
    return NextResponse.json({ success: true, destinations: defaultDestinations });
  }
}
