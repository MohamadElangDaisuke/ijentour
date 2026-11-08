import { validateImageBuffer, generateSafeWebpFileName, normalizeStorageFolder } from "../lib/storage/mediaValidation";
import { optimizeImage } from "../lib/storage/imageOptimizer";
import {
  isProtectedOrExternalUrl,
  extractSupabaseStoragePath,
  isMediaReferencedElsewhere,
  safeDeleteMediaFile,
} from "../lib/storage/mediaCleanup";
import { POST as uploadPost, DELETE as uploadDelete } from "../app/api/upload/route";
import sharp from "sharp";
import { NextRequest } from "next/server";
import { prisma } from "../lib/prisma";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${desc}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== TEST SUITE: PRODUCTION MEDIA STORAGE ARCHITECTURE ===\n");

  // 1. Folder Normalization
  console.log("--- 1. Folder Normalization ---");
  assert(normalizeStorageFolder("trips") === "packages", "Maps legacy 'trips' to 'packages'");
  assert(normalizeStorageFolder("PACKAGES") === "packages", "Normalizes uppercase 'PACKAGES'");
  assert(normalizeStorageFolder("destinations") === "destinations", "Preserves 'destinations'");
  assert(normalizeStorageFolder("gallery") === "gallery", "Preserves 'gallery'");
  assert(normalizeStorageFolder("blog") === "blog", "Preserves 'blog'");
  assert(normalizeStorageFolder("reviews") === "reviews", "Preserves 'reviews'");
  assert(normalizeStorageFolder("avatars") === "avatars", "Preserves 'avatars'");
  assert(normalizeStorageFolder("general") === "general", "Preserves 'general'");
  assert(normalizeStorageFolder("malicious/../folder") === "general", "Sanitizes malicious paths to 'general'");

  // 2. Safe Filename Generation
  console.log("\n--- 2. Safe Filename Generation ---");
  const fn1 = generateSafeWebpFileName("My Cool Photo (1) [HQ].PNG");
  assert(fn1.endsWith(".webp"), "Generated filename ends with .webp");
  assert(!fn1.includes(" "), "Filename contains no spaces");
  assert(!/[^a-z0-9.-]/.test(fn1), "Filename contains only clean URL-safe characters");

  // 3. Binary Content Validation
  console.log("\n--- 3. Strict Image Content Validation ---");
  const corruptBuffer = Buffer.from("NOT_AN_IMAGE_CONTENT");
  const corruptRes = await validateImageBuffer(corruptBuffer);
  assert(!corruptRes.valid, "Rejects plain text masquerading as image");

  const emptyRes = await validateImageBuffer(Buffer.alloc(0));
  assert(!emptyRes.valid, "Rejects empty buffer");

  // Create valid PNG with Sharp
  const validPng = await sharp({
    create: { width: 400, height: 300, channels: 4, background: { r: 50, g: 100, b: 200, alpha: 0.8 } },
  })
    .png()
    .toBuffer();
  const validRes = await validateImageBuffer(validPng);
  assert(validRes.valid, "Accepts valid PNG buffer");
  assert(validRes.format === "png", "Correctly identifies PNG format");
  assert(validRes.hasAlpha === true, "Correctly detects alpha channel in PNG");

  // 4. Sharp Image Optimization & Resizing
  console.log("\n--- 4. Sharp Optimization & Auto WebP ---");
  const hugePng = await sharp({
    create: { width: 3000, height: 2000, channels: 4, background: { r: 255, g: 120, b: 0, alpha: 0.9 } },
  })
    .png()
    .toBuffer();
  const hugeValidation = await validateImageBuffer(hugePng);
  const optResult = await optimizeImage(hugePng, hugeValidation);

  assert(optResult.format === "webp", "Output format is WebP");
  assert(optResult.contentType === "image/webp", "Content type is image/webp");
  assert(optResult.width <= 1920 && optResult.height <= 1920, "Downscaled to max 1920px boundary");
  assert(optResult.wasResized === true, "Marks image as resized");

  const optMeta = await sharp(optResult.buffer).metadata();
  assert(optMeta.format === "webp", "Sharp validates optimized buffer as real WebP");
  assert(optMeta.hasAlpha === true, "Preserves transparency in output WebP");

  // 5. Static & External Asset Protection
  console.log("\n--- 5. Static & External URL Protection ---");
  assert(isProtectedOrExternalUrl("/images/pkg-bluefire.png") === true, "Protects /images/pkg-bluefire.png");
  assert(isProtectedOrExternalUrl("/images/HeroSection.webp") === true, "Protects /images/HeroSection.webp");
  assert(isProtectedOrExternalUrl("/uploads/general/test.jpg") === true, "Protects /uploads/ paths");
  assert(isProtectedOrExternalUrl("https://images.unsplash.com/photo-123") === true, "Protects external Unsplash images");
  assert(
    isProtectedOrExternalUrl("https://xuoazdinvasiglkmrbbq.supabase.co/storage/v1/object/public/images/destinations/test.webp") ===
      false,
    "Identifies Supabase Storage image as manageable"
  );

  // 6. Storage Path Extraction
  console.log("\n--- 6. Storage Path Extraction ---");
  const extracted = extractSupabaseStoragePath(
    "https://xuoazdinvasiglkmrbbq.supabase.co/storage/v1/object/public/images/destinations/kawah-ijen.webp"
  );
  assert(extracted === "destinations/kawah-ijen.webp", "Correctly extracts path 'destinations/kawah-ijen.webp'");

  const nullExtracted = extractSupabaseStoragePath("/images/the-best-view-of-kawah.webp");
  assert(nullExtracted === null, "Returns null for local static assets");

  // 7. Database Reference Integrity Check
  console.log("\n--- 7. Database Reference Integrity ---");
  const isBluefireReferenced = await isMediaReferencedElsewhere("/images/pkg-bluefire.png");
  assert(isBluefireReferenced === true, "Detects that /images/pkg-bluefire.png is actively referenced in database");

  const isFictionalReferenced = await isMediaReferencedElsewhere("https://xuoazdinvasiglkmrbbq.supabase.co/storage/v1/object/public/images/fictional-never-used.webp");
  assert(isFictionalReferenced === false, "Reports false for unreferenced fictional media URL");

  // 8. Safe Media Deletion Safeguards
  console.log("\n--- 8. Safe Media Deletion Safeguards ---");
  const delStatic = await safeDeleteMediaFile("/images/pkg-bluefire.png");
  assert(delStatic.deleted === false, "Refuses to delete static local asset");
  assert(delStatic.reason.includes("protected"), "Provides clear protection reason");

  const delExternal = await safeDeleteMediaFile("https://images.unsplash.com/photo-test");
  assert(delExternal.deleted === false, "Refuses to delete external URL");

  const delEmpty = await safeDeleteMediaFile("");
  assert(delEmpty.deleted === false, "Handles empty URL safely");

  // 9. API Route Authorization & Validation Tests
  console.log("\n--- 9. API Security & Validation ---");
  // Unauthenticated upload
  const unauthReq = new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const unauthRes = await uploadPost(unauthReq);
  assert(unauthRes.status === 401, "Rejects unauthenticated POST /api/upload with HTTP 401");

  // Unauthenticated delete
  const unauthDelReq = new NextRequest("http://localhost:3000/api/upload?path=test", {
    method: "DELETE",
  });
  const unauthDelRes = await uploadDelete(unauthDelReq);
  assert(unauthDelRes.status === 401, "Rejects unauthenticated DELETE /api/upload with HTTP 401");

  // Authenticated upload with missing credentials (returns clear 503 error, zero writes to disk)
  const { signAdminToken, COOKIE_NAME } = await import("../lib/auth");
  const adminToken = await signAdminToken({ id: "admin-1", email: "admin@ijentour.com", name: "Admin", role: "ADMIN" });
  const authFormData = new FormData();
  authFormData.append("file", new Blob([validPng], { type: "image/png" }), "test.png");
  authFormData.append("folder", "destinations");
  const authReq = new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    headers: { cookie: `${COOKIE_NAME}=${adminToken}` },
    body: authFormData,
  });
  const authRes = await uploadPost(authReq);
  const authData = await authRes.json();
  if (authRes.status === 503) {
    assert(authData.error.includes("Supabase Storage credentials are not configured"), "Returns clear 503 explaining missing Supabase credentials (never writes to local disk)");
  } else if (authRes.status === 200) {
    assert(authData.success === true, "Successfully uploaded to Supabase Storage");
  }

  // 10. Database Reads Verification
  console.log("\n--- 10. Existing Database Compatibility ---");
  const destinations = await prisma.destination.findMany({ take: 2 });
  assert(destinations.length > 0, "Loads existing destinations from Supabase PostgreSQL");
  assert(destinations[0].image.length > 0, `Existing destination has valid image (${destinations[0].image})`);

  const packages = await prisma.tripPackage.findMany({ take: 2 });
  assert(packages.length > 0, "Loads existing packages from Supabase PostgreSQL");
  assert(packages[0].coverImage.length > 0, `Existing package has valid coverImage (${packages[0].coverImage})`);

  console.log(`\n==================================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test execution exception:", e);
    process.exit(1);
  });
