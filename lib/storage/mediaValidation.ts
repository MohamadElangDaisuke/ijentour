import sharp from "sharp";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ALLOWED_STORAGE_FOLDERS = [
  "destinations",
  "packages",
  "gallery",
  "blog",
  "reviews",
  "avatars",
  "general",
] as const;

export type StorageFolder = (typeof ALLOWED_STORAGE_FOLDERS)[number];

/**
 * Normalizes folder string, mapping legacy 'trips' to 'packages'
 */
export function normalizeStorageFolder(rawFolder?: string | null): StorageFolder {
  if (!rawFolder) return "general";
  const cleaned = rawFolder.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");

  if (cleaned === "trips" || cleaned === "packages") {
    return "packages";
  }

  if (ALLOWED_STORAGE_FOLDERS.includes(cleaned as StorageFolder)) {
    return cleaned as StorageFolder;
  }

  return "general";
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  format?: string;
  width?: number;
  height?: number;
  hasAlpha?: boolean;
}

/**
 * Validates actual binary image content using sharp metadata inspection.
 * Rejects corrupt files, non-images, SVG, GIF, PDF, executables, or unsupported formats.
 */
export async function validateImageBuffer(buffer: Buffer<any>): Promise<ImageValidationResult> {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "Empty file buffer received." };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 5 MB limit (${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format) {
      return {
        valid: false,
        error: "Unrecognized image format. Only JPEG, PNG, and WebP are allowed.",
      };
    }

    const acceptedFormats = ["jpeg", "png", "webp"];
    if (!acceptedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Unsupported image format (${metadata.format.toUpperCase()}). Please upload JPG, PNG, or WebP.`,
      };
    }

    if (!metadata.width || !metadata.height || metadata.width <= 0 || metadata.height <= 0) {
      return {
        valid: false,
        error: "Invalid image dimensions.",
      };
    }

    return {
      valid: true,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      hasAlpha: Boolean(metadata.hasAlpha),
    };
  } catch {
    return {
      valid: false,
      error: "Corrupted or invalid image file. Please choose a valid image.",
    };
  }
}

/**
 * Generates a clean, unique filename with .webp extension.
 */
export function generateSafeWebpFileName(originalName: string): string {
  const baseName = originalName
    .substring(0, originalName.lastIndexOf(".") > 0 ? originalName.lastIndexOf(".") : originalName.length)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "image";

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${baseName}-${timestamp}-${randomSuffix}.webp`;
}

