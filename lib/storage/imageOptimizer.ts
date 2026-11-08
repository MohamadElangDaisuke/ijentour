import sharp from "sharp";
import { ImageValidationResult } from "./mediaValidation";

export interface OptimizationResult {
  buffer: Buffer<any>;
  contentType: string;
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes: number;
  format: "webp";
  wasResized: boolean;
}

const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 82;

/**
 * Optimizes image buffer:
 * 1. Resizes down to max 1920x1920 (fit inside, aspect preserved, without enlargement)
 * 2. Encodes to WebP (quality 82, effort 4)
 * 3. Preserves alpha channel if present
 * 4. Checks size efficiency to avoid unnecessary expansion on tiny already-WebP images
 */
export async function optimizeImage(
  inputBuffer: Buffer<any>,
  validation: ImageValidationResult
): Promise<OptimizationResult> {
  const originalWidth = validation.width || 0;
  const originalHeight = validation.height || 0;
  const wasResized = originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION;

  let pipeline = sharp(inputBuffer);

  // Resize only if either dimension exceeds 1920px
  if (wasResized) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // WebP compression
  const webpBuffer = await pipeline
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      alphaQuality: 90,
      smartSubsample: true,
    })
    .toBuffer();

  // If the input was already WebP, wasn't resized, and the original was smaller, preserve original
  let finalBuffer: Buffer<any> = webpBuffer;
  if (!wasResized && validation.format === "webp" && inputBuffer.length < webpBuffer.length) {
    finalBuffer = inputBuffer;
  }

  const finalMeta = await sharp(finalBuffer).metadata();

  return {
    buffer: finalBuffer,
    contentType: "image/webp",
    width: finalMeta.width || originalWidth,
    height: finalMeta.height || originalHeight,
    sizeBytes: finalBuffer.length,
    originalSizeBytes: inputBuffer.length,
    format: "webp",
    wasResized,
  };
}

