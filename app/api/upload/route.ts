import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  normalizeStorageFolder,
  validateImageBuffer,
  generateSafeWebpFileName,
} from "@/lib/storage/mediaValidation";
import { optimizeImage } from "@/lib/storage/imageOptimizer";
import { safeDeleteMediaFile } from "@/lib/storage/mediaCleanup";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication & Authorization: Admin only
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login as an administrator." },
        { status: 401 }
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = formData.get("folder") as string | null;
    const folder = normalizeStorageFolder(rawFolder);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file selected for upload." },
        { status: 400 }
      );
    }

    // 3. Fast client-header validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum limit is 5 MB.`,
        },
        { status: 400 }
      );
    }

    const clientType = file.type?.toLowerCase() || "";
    if (clientType && !ALLOWED_MIME_TYPES.includes(clientType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported image format. Please select JPG, JPEG, PNG, or WebP images.",
        },
        { status: 400 }
      );
    }

    // 4. Convert file to Buffer & perform strict binary content validation via sharp
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = await validateImageBuffer(buffer);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "The uploaded file is not a valid or supported image.",
        },
        { status: 400 }
      );
    }

    // 5. Automatic Image Optimization: resize (>1920px) & convert to WebP (quality 82, alpha preserved)
    const optimized = await optimizeImage(buffer, validation);

    // 6. Ensure Supabase Storage is configured
    const targetClient = supabaseAdmin || supabase;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xuoazdinvasiglkmrbbq.supabase.co";

    if (!targetClient) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase Storage credentials are not configured on the server. Please ensure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are set.",
        },
        { status: 503 }
      );
    }

    // 7. Generate safe unique filename
    const fileName = generateSafeWebpFileName(file.name || "image");
    const storagePath = `${folder}/${fileName}`;

    // 8. Upload directly to Supabase Storage bucket 'images' (NEVER write to local Vercel filesystem)
    const { data: uploadData, error: uploadError } = await targetClient.storage
      .from("images")
      .upload(storagePath, optimized.buffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError || !uploadData) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: uploadError?.message || "Failed to upload image to Supabase Storage.",
        },
        { status: 502 }
      );
    }

    // 9. Construct canonical public CDN URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${storagePath}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath,
      folder,
      format: "webp",
      width: optimized.width,
      height: optimized.height,
      sizeBytes: optimized.sizeBytes,
      originalSizeBytes: optimized.originalSizeBytes,
      wasResized: optimized.wasResized,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred while processing the upload.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authentication & Authorization: Admin only
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login as an administrator." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawPath = searchParams.get("path") || searchParams.get("url");

    if (!rawPath) {
      return NextResponse.json(
        { success: false, error: "Path or URL parameter is required." },
        { status: 400 }
      );
    }

    // Perform reference-safe deletion
    const result = await safeDeleteMediaFile(rawPath);

    return NextResponse.json({
      success: result.deleted,
      message: result.reason,
    });
  } catch (error: any) {
    console.error("DELETE /api/upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete image." },
      { status: 500 }
    );
  }
}
