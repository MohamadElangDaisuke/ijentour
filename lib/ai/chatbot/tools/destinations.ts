import { prisma } from "@/lib/prisma";

export interface CleanDestinationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  tag?: string | null;
  isFeatured: boolean;
}

/**
 * Fetch all official destinations from the database.
 */
export async function getAllDestinations(): Promise<CleanDestinationData[]> {
  const dbDestinations = await prisma.destination.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return dbDestinations.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: d.description,
    image: d.image,
    tag: d.tag,
    isFeatured: d.isFeatured,
  }));
}

/**
 * Get a single destination by ID or slug.
 */
export async function getDestinationByIdOrSlug(
  idOrSlug: string
): Promise<CleanDestinationData | null> {
  const destination = await prisma.destination.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });

  return destination
    ? {
        id: destination.id,
        name: destination.name,
        slug: destination.slug,
        description: destination.description,
        image: destination.image,
        tag: destination.tag,
        isFeatured: destination.isFeatured,
      }
    : null;
}

/**
 * Search destinations by keywords.
 */
export async function searchDestinations(query: string): Promise<CleanDestinationData[]> {
  const all = await getAllDestinations();
  const lower = query.toLowerCase().trim();
  if (!lower) return all;

  return all.filter(
    (d) =>
      d.name.toLowerCase().includes(lower) ||
      d.description.toLowerCase().includes(lower) ||
      (d.tag && d.tag.toLowerCase().includes(lower))
  );
}
