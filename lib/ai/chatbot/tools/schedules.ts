import { prisma } from "@/lib/prisma";

export interface CleanScheduleData {
  id: string;
  tripPackageId: string;
  packageTitle: string;
  departureDate: string;
  availableSlots: number;
  bookedSlots: number;
  status: string;
}

/**
 * Fetch upcoming open schedules for active packages.
 */
export async function getUpcomingSchedules(
  packageId?: string
): Promise<CleanScheduleData[]> {
  const whereClause: any = {
    status: "OPEN",
    tripPackage: {
      isActive: true,
    },
  };

  if (packageId) {
    whereClause.tripPackageId = packageId;
  }

  const schedules = await prisma.tripSchedule.findMany({
    where: whereClause,
    orderBy: { departureDate: "asc" },
    include: {
      tripPackage: {
        select: {
          title: true,
        },
      },
    },
    take: 20,
  });

  return schedules.map((s) => ({
    id: s.id,
    tripPackageId: s.tripPackageId,
    packageTitle: s.tripPackage.title,
    departureDate: s.departureDate,
    availableSlots: s.availableSlots,
    bookedSlots: s.bookedSlots,
    status: s.status,
  }));
}
