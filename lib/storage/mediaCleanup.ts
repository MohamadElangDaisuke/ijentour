import { prisma } from "@/lib/prisma";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export interface ExclusionContext {
  model: "tripPackage" | "destination" | "galleryItem" | "blogPost" | "user" | "review";
  id: string;
}

/**
 * Checks if a URL is a static asset, local file, or external third-party URL.
 * These must NEVER be deleted by media cleanup!
 */
export function isProtectedOrExternalUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return true;

  const trimmed = url.trim();

  // Protect local static assets
  if (trimmed.startsWith("/images/") || trimmed.startsWith("/uploads/") || trimmed.startsWith("/assets/")) {
    return true;
  }

  // Protect relative paths
  if (trimmed.startsWith("/") && !trimmed.startsWith("/storage/")) {
    return true;
  }

  // If it doesn't match Supabase Storage domain or structure, treat as external (e.g. Unsplash)
  const isSupabaseStorage =
    trimmed.includes("supabase.co/storage/v1/object/") ||
    trimmed.includes("/storage/v1/object/public/images/");

  return !isSupabaseStorage;
}

/**
 * Extracts the storage object path inside the 'images' bucket from a public URL.
 * Example:
 * https://xyz.supabase.co/storage/v1/object/public/images/destinations/photo.webp
 * -> "destinations/photo.webp"
 */
export function extractSupabaseStoragePath(url?: string | null, bucket = "images"): string | null {
  if (!url || isProtectedOrExternalUrl(url)) return null;

  try {
    const pattern = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`, "i");
    const match = url.match(pattern);
    if (match && match[1]) {
      return decodeURIComponent(match[1].split("?")[0]);
    }

    const parsed = new URL(url);
    const prefix = `/storage/v1/object/public/${bucket}/`;
    const index = parsed.pathname.indexOf(prefix);
    if (index !== -1) {
      return decodeURIComponent(parsed.pathname.substring(index + prefix.length));
    }
  } catch {
    // URL parsing failed
  }

  return null;
}

/**
 * Checks if an image URL is referenced by any database entity,
 * optionally excluding the specific entity currently being updated or deleted.
 */
export async function isMediaReferencedElsewhere(
  url: string,
  exclude?: ExclusionContext
): Promise<boolean> {
  if (!url) return false;

  try {
    // 1. Check TripPackage (coverImage, ogImage, or galleryImages JSON)
    const tripWhere: any = {
      OR: [
        { coverImage: url },
        { ogImage: url },
        { galleryImages: { contains: url } },
      ],
    };
    if (exclude?.model === "tripPackage") {
      tripWhere.NOT = { id: exclude.id };
    }
    const tripMatch = await prisma.tripPackage.findFirst({
      where: tripWhere,
      select: { id: true },
    });
    if (tripMatch) return true;

    // 2. Check Destination
    const destWhere: any = { image: url };
    if (exclude?.model === "destination") {
      destWhere.NOT = { id: exclude.id };
    }
    const destMatch = await prisma.destination.findFirst({
      where: destWhere,
      select: { id: true },
    });
    if (destMatch) return true;

    // 3. Check GalleryItem (image, thumbnailUrl)
    const galWhere: any = {
      OR: [{ image: url }, { thumbnailUrl: url }],
    };
    if (exclude?.model === "galleryItem") {
      galWhere.NOT = { id: exclude.id };
    }
    const galMatch = await prisma.galleryItem.findFirst({
      where: galWhere,
      select: { id: true },
    });
    if (galMatch) return true;

    // 4. Check BlogPost
    const blogWhere: any = { image: url };
    if (exclude?.model === "blogPost") {
      blogWhere.NOT = { id: exclude.id };
    }
    const blogMatch = await prisma.blogPost.findFirst({
      where: blogWhere,
      select: { id: true },
    });
    if (blogMatch) return true;

    // 5. Check User (avatarUrl)
    const userWhere: any = { avatarUrl: url };
    if (exclude?.model === "user") {
      userWhere.NOT = { id: exclude.id };
    }
    const userMatch = await prisma.user.findFirst({
      where: userWhere,
      select: { id: true },
    });
    if (userMatch) return true;

    // 6. Check Review (photoUrls JSON)
    const reviewWhere: any = { photoUrls: { contains: url } };
    if (exclude?.model === "review") {
      reviewWhere.NOT = { id: exclude.id };
    }
    const reviewMatch = await prisma.review.findFirst({
      where: reviewWhere,
      select: { id: true },
    });
    if (reviewMatch) return true;

    return false;
  } catch (error) {
    console.error("Error checking media references:", error);
    // On error, be cautious and pretend it's referenced so we don't delete accidentally
    return true;
  }
}

/**
 * Safely removes a file from Supabase Storage ONLY IF:
 * 1. It is a valid Supabase Storage object (not static /images/* or external).
 * 2. It is not referenced by any other record in the database.
 */
export async function safeDeleteMediaFile(
  url?: string | null,
  exclude?: ExclusionContext
): Promise<{ deleted: boolean; reason: string }> {
  if (!url) {
    return { deleted: false, reason: "No URL provided." };
  }

  if (isProtectedOrExternalUrl(url)) {
    return { deleted: false, reason: "Static, local, or external image protected from deletion." };
  }

  const storagePath = extractSupabaseStoragePath(url);
  if (!storagePath) {
    return { deleted: false, reason: "Could not resolve Supabase storage path from URL." };
  }

  const isReferenced = await isMediaReferencedElsewhere(url, exclude);
  if (isReferenced) {
    return {
      deleted: false,
      reason: "File is still referenced by another record in the database. Deletion skipped.",
    };
  }

  const client = supabaseAdmin || supabase;
  if (!client) {
    return {
      deleted: false,
      reason: "Supabase client is not configured; file could not be deleted from storage.",
    };
  }

  try {
    const { error } = await client.storage.from("images").remove([storagePath]);
    if (error) {
      console.warn(`Failed to delete Supabase storage object '${storagePath}':`, error.message);
      return { deleted: false, reason: error.message };
    }

    return { deleted: true, reason: `Successfully deleted '${storagePath}' from Supabase Storage.` };
  } catch (err: any) {
    console.warn(`Exception deleting Supabase storage object '${storagePath}':`, err.message);
    return { deleted: false, reason: err.message };
  }
}

