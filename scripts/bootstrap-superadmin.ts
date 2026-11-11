import "dotenv/config";
import * as bcrypt from "bcryptjs";
import readline from "readline";
import { prisma } from "../lib/prisma";

async function promptPassword(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main() {
  console.log("=================================================================");
  console.log("   MOUNT IJEN TOUR - SECURE SUPER ADMIN BOOTSTRAP GENERATOR     ");
  console.log("=================================================================\n");

  const email = (process.env.BOOTSTRAP_SUPERADMIN_EMAIL || "elangdaisuke544@gmail.com").trim().toLowerCase();
  const username = "superadmin";

  // 1. SAFETY CHECK: Check whether the target email already exists in the database
  console.log(`[Pemeriksaan Keamanan] Memeriksa keberadaan email '${email}' di database...`);
  try {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (existingEmail) {
      console.error("\n❌ [KONFLIK KEAMANAN TERDETEKSI]");
      console.error(`Akun dengan email '${email}' sudah terdaftar sebelumnya di database:`);
      console.error(` - User ID : ${existingEmail.id}`);
      console.error(` - Nama    : ${existingEmail.name}`);
      console.error(` - Peran   : ${existingEmail.role}`);
      console.error(` - Dibuat  : ${existingEmail.createdAt}`);
      console.error("\nPEMBERHENTIAN AMAN:");
      console.error("Generator membatalkan operasi dan TIDAK AKAN secara otomatis menimpa password, username,");
      console.error("atau peran akun yang sudah ada untuk mencegah privilege escalation atau penimpaan akun tanpa hak.");
      console.error("Silakan verifikasi integritas data secara manual sebelum melanjutkan.\n");
      process.exit(1);
    }
  } catch (err: any) {
    console.warn(`[Peringatan] Gagal memeriksa email via Prisma: ${err.message}`);
  }

  // 2. SAFETY CHECK: Check whether target username 'superadmin' is already taken
  try {
    const existingUsername = await (prisma as any).user.findFirst({
      where: { username },
      select: { id: true, email: true, role: true },
    });

    if (existingUsername) {
      console.error("\n❌ [KONFLIK USERNAME TERDETEKSI]");
      console.error(`Username '${username}' sudah digunakan oleh akun lain (${existingUsername.email}).`);
      console.error("Proses bootstrap dibatalkan demi keamanan.\n");
      process.exit(1);
    }
  } catch {
    // If username column does not exist yet prior to migration, skip
  }

  // 3. Password input (ephemeral env or interactive prompt)
  let rawPassword = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD;

  if (!rawPassword) {
    rawPassword = await promptPassword("Masukkan kata sandi baru untuk akun Super Admin: ");
  }

  if (!rawPassword || rawPassword.length < 6) {
    console.error("❌ Error: Kata sandi minimal 6 karakter.");
    process.exit(1);
  }

  console.log(`\nGenerating secure Bcrypt hash (cost factor: 10)...`);
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  console.log(`✅ Bcrypt hash generated successfully.\n`);
  console.log("-----------------------------------------------------------------");
  console.log("EKSEKUSI SQL DI SUPABASE SQL EDITOR (SETELAH MIGRASI SKEMA DB):");
  console.log("-----------------------------------------------------------------\n");

  // Pure INSERT statement without ON CONFLICT DO UPDATE (Safe & Non-Destructive)
  // Phone is explicitly NULL (no unconfirmed phone numbers assumed)
  // emailVerified is explicitly NULL (requires OTP verification by owner)
  const sql = `
-- 1. Bootstrap First SUPER_ADMIN (Email: ${email}, Username: ${username})
-- Syarat Keamanan:
-- - Tidak menimpa akun eksisting (Pure INSERT, gagal jika ada duplikasi)
-- - Telepon diset NULL (tidak mengasumsikan nomor sebelum dikonfirmasi)
-- - emailVerified diset NULL (wajib melewati verifikasi OTP sebelum hak akses penuh aktif)
INSERT INTO "users" (
  "id",
  "username",
  "name",
  "email",
  "passwordHash",
  "role",
  "phone",
  "isActive",
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  'superadmin_' || substr(md5(random()::text), 1, 16),
  '${username}',
  'Super Administrator (Elang Daisuke)',
  '${email}',
  '${passwordHash}',
  'SUPER_ADMIN',
  NULL,
  true,
  NULL,
  NOW(),
  NOW()
);
`;

  console.log(sql.trim());
  console.log("\n-----------------------------------------------------------------");
  console.log("PERINGATAN KEAMANAN:");
  console.log("1. Simpan kata sandi ini di password manager Anda.");
  console.log("2. Jangan lakukan commit script atau log yang memuat hash ini ke repository publik.");
  console.log("=================================================================\n");

  // Optional: Direct insertion via Prisma if --apply flag is provided
  const shouldApply = process.argv.includes("--apply");
  if (shouldApply) {
    console.log("[Eksekusi Langsung] Memasukkan akun Super Admin langsung ke database via Prisma Client...");
    try {
      const created = await prisma.user.create({
        data: {
          id: "superadmin_" + Math.random().toString(36).substring(2, 10),
          username,
          name: "Super Administrator (Elang Daisuke)",
          email,
          passwordHash,
          role: "SUPER_ADMIN",
          phone: null,
          isActive: true,
          emailVerified: null,
        },
      });
      console.log(`\n🎉 [BERHASIL] Akun Super Admin '${created.name}' (@${created.username}) berhasil dimasukkan ke database!`);
      console.log(` - User ID : ${created.id}`);
      console.log(` - Email   : ${created.email}`);
      console.log(` - Role    : ${created.role}`);
      console.log(` - Status  : Aktif (Menunggu Verifikasi OTP Login Pertama)\n`);
    } catch (err: any) {
      console.error("\n❌ [GAGAL MEMASUKKAN AKUN VIA PRISMA]:", err.message);
      console.log("Silakan salin dan eksekusi kueri SQL di atas secara manual di Supabase SQL Editor.\n");
    }
  } else {
    console.log("TIPS:");
    console.log("• Default: Mencetak pernyataan SQL untuk dieksekusi manual di Supabase SQL Editor.");
    console.log("• Otomatis: Tambahkan flag '--apply' ('npx tsx scripts/bootstrap-superadmin.ts --apply') untuk memasukkan langsung ke database via Prisma setelah skema tersinkronisasi.\n");
  }
}

main()
  .catch((err) => {
    console.error("Fatal bootstrap error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
