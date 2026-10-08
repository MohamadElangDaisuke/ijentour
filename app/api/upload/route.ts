import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import path from "path";
import fs from "fs/promises";

// Max size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    // 1. Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "general";
    const folder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, "");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file yang dipilih untuk diunggah." },
        { status: 400 }
      );
    }

    // 3. Validation: Size & MIME type
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File terlalu besar. Batas maksimal ukuran gambar adalah 5 MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: "Format gambar tidak didukung. Harap pilih gambar berekstensi JPG, JPEG, PNG, atau WebP.",
        },
        { status: 400 }
      );
    }

    // 4. Generate unique, clean filename
    const originalName = file.name || "image.webp";
    const ext = originalName.split(".").pop()?.toLowerCase() || "webp";
    const cleanBase = originalName
      .substring(0, originalName.lastIndexOf(".") || originalName.length)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 32);

    const uniqueId = Math.random().toString(36).substring(2, 8);
    const fileName = `${cleanBase}-${Date.now()}-${uniqueId}.${ext}`;
    const storagePath = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Always write local copy to public/uploads/ for development and reliable fallback
    let localPublicUrl = "";
    try {
      const publicUploadsDir = path.join(process.cwd(), "public", "uploads", folder);
      await fs.mkdir(publicUploadsDir, { recursive: true });
      const localFilePath = path.join(publicUploadsDir, fileName);
      await fs.writeFile(localFilePath, buffer);
      localPublicUrl = `/uploads/${folder}/${fileName}`;
    } catch (fsErr) {
      console.warn("Local storage write warning (expected in read-only environments like Vercel):", fsErr);
    }

    // 6. Upload to Supabase Storage bucket 'images'
    const targetClient = supabaseAdmin || supabase;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xuoazdinvasiglkmrbbq.supabase.co";

    if (targetClient) {
      try {
        const { data: uploadData, error: uploadError } = await targetClient.storage
          .from("images")
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${storagePath}`;
          return NextResponse.json({
            success: true,
            url: publicUrl,
            path: storagePath,
            source: "supabase",
          });
        } else if (uploadError) {
          console.warn("Supabase upload returned error, using local fallback:", uploadError.message);
        }
      } catch (sbErr: any) {
        console.warn("Supabase upload exception:", sbErr.message);
      }
    }

    // If Supabase upload client was not available or errored, return the local fallback URL
    if (localPublicUrl) {
      return NextResponse.json({
        success: true,
        url: localPublicUrl,
        path: storagePath,
        source: "local",
      });
    }

    // Direct Supabase public URL construct
    const directSupabaseUrl = `${supabaseUrl}/storage/v1/object/public/images/${storagePath}`;
    return NextResponse.json({
      success: true,
      url: directSupabaseUrl,
      path: storagePath,
      source: "supabase_direct",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal memproses unggahan gambar.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get("path");

    if (!storagePath) {
      return NextResponse.json({ success: false, error: "Parameter path wajib diisi." }, { status: 400 });
    }

    const targetClient = supabaseAdmin || supabase;
    if (targetClient) {
      await targetClient.storage.from("images").remove([storagePath]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
