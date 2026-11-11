import "dotenv/config";
import * as bcrypt from "bcryptjs";
import readline from "readline";
import { prisma } from "../lib/prisma";

const TARGET_USER_ID = (process.env.RESET_SUPERADMIN_ID || "superadmin_p6ahd24k").trim();
const TARGET_EMAIL = (process.env.RESET_SUPERADMIN_EMAIL || "elangdaisuke544@gmail.com").trim().toLowerCase();

/**
 * Reads password from terminal without echoing keystrokes to prevent exposure.
 */
function promptHiddenInput(query: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(query);

    const stdin = process.stdin;
    if (stdin.isTTY) {
      const wasRaw = stdin.isRaw;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");

      let input = "";

      const onData = (chunk: string | Buffer) => {
        const str = chunk.toString();
        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          if (char === "\n" || char === "\r" || char === "\u0004") {
            // Enter key
            stdin.setRawMode(wasRaw || false);
            stdin.pause();
            stdin.removeListener("data", onData);
            process.stdout.write("\n");
            resolve(input);
            return;
          } else if (char === "\u0003") {
            // Ctrl+C
            stdin.setRawMode(wasRaw || false);
            process.stdout.write("\nOperasi dibatalkan oleh pengguna.\n");
            process.exit(130);
          } else if (char === "\u007f" || char === "\b") {
            // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
            }
          } else if (char.charCodeAt(0) >= 32) {
            input += char;
          }
        }
      };

      stdin.on("data", onData);
    } else {
      // Non-interactive / non-TTY fallback
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("", (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    }
  });
}

/**
 * Validates password strength:
 * - Minimum 12 characters
 * - Uppercase, lowercase, number, symbol
 */
function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Panjang kata sandi minimal 12 karakter.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Wajib mengandung minimal 1 huruf besar (A-Z).");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Wajib mengandung minimal 1 huruf kecil (a-z).");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Wajib mengandung minimal 1 angka (0-9).");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push("Wajib mengandung minimal 1 simbol / karakter khusus (!@#$%^&* dll).");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

async function main() {
  console.log("=================================================================");
  console.log("    MOUNT IJEN TOUR - SECURE SUPER ADMIN PASSWORD RESET UTIL    ");
  console.log("=================================================================\n");

  const isCheckOnly = process.argv.includes("--check") || process.argv.includes("--verify-only");

  console.log(`[1/3] Mencari dan memvalidasi akun target di database...`);
  console.log(` - Target ID    : ${TARGET_USER_ID}`);
  console.log(` - Target Email : ${TARGET_EMAIL}`);

  // 1. Locate existing account strictly by ID and Email
  const user = await prisma.user.findFirst({
    where: {
      id: TARGET_USER_ID,
      email: TARGET_EMAIL,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    console.error("\n❌ [GAGAL] Akun Super Admin dengan ID dan Email tersebut tidak ditemukan di database.");
    console.error("   Pastikan ID dan Email sesuai dengan akun yang terdaftar.");
    process.exit(1);
  }

  // 2. Strict Role Verification
  if (user.role !== "SUPER_ADMIN") {
    console.error(`\n❌ [PELANGGARAN HAK AKSES] Akun target memiliki peran '${user.role}', BUKAN 'SUPER_ADMIN'.`);
    console.error("   Utilitas ini hanya diizinkan untuk mereset kata sandi akun SUPER_ADMIN.");
    process.exit(1);
  }

  // 3. Strict Active Account Verification
  if (!user.isActive) {
    console.error("\n❌ [AKUN TIDAK AKTIF] Akun Super Admin dalam status dinonaktifkan (isActive = false).");
    console.error("   Operasi reset kata sandi dibatalkan demi keamanan.");
    process.exit(1);
  }

  console.log(`✅ Akun ditemukan dan validasi hak akses berhasil:`);
  console.log(` - Nama     : ${user.name}`);
  console.log(` - Username : @${user.username}`);
  console.log(` - Email    : ${user.email}`);
  console.log(` - Peran    : ${user.role}`);
  console.log(` - Status   : ${user.isActive ? "Aktif" : "Nonaktif"}`);

  // Mode verifikasi cepat (dry run)
  if (isCheckOnly) {
    console.log("\n[Mode Verifikasi] Akun terverifikasi dengan aman. Tidak ada perubahan yang dilakukan pada database.");
    process.exit(0);
  }

  // 4. Prompt for new password interactively with hidden input
  console.log("\n[2/3] Masukkan kata sandi baru (input terminal disembunyikan demi keamanan):");
  const newPassword = await promptHiddenInput("Masukkan Kata Sandi Baru: ");

  if (!newPassword) {
    console.error("❌ Kata sandi tidak boleh kosong.");
    process.exit(1);
  }

  // 5. Password Strength Validation
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    console.error("\n❌ [KELEMAHAN KATA SANDI] Kata sandi tidak memenuhi kriteria keamanan:");
    validation.errors.forEach((err) => console.error(`   - ${err}`));
    console.error("\nSilakan jalankan ulang script dengan kata sandi yang lebih kuat.");
    process.exit(1);
  }

  // 6. Confirm new password
  const confirmPassword = await promptHiddenInput("Konfirmasi Kata Sandi Baru: ");
  if (newPassword !== confirmPassword) {
    console.error("\n❌ [KONFIRMASI GAGAL] Konfirmasi kata sandi tidak cocok. Operasi dibatalkan.");
    process.exit(1);
  }

  // 7. Hash using bcryptjs with cost factor 10
  console.log("\n[3/3] Menghasilkan hash Bcrypt aman...");
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // 8. Update ONLY passwordHash
  console.log("Memperbarui kata sandi di database Supabase...");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    },
  });

  console.log("\n=================================================================");
  console.log("🎉 [SUKSES] Kata sandi akun Super Admin berhasil diperbarui!");
  console.log("=================================================================");
  console.log(` - User ID  : ${user.id}`);
  console.log(` - Username : @${user.username}`);
  console.log(` - Email    : ${user.email}`);
  console.log(` - Peran    : ${user.role}`);
  console.log(` - Waktu    : ${new Date().toISOString()}`);
  console.log("\nCatatan Keamanan:");
  console.log("• Username, email, role, dan emailVerified akun tetap dipertahankan tanpa perubahan.");
  console.log("• Tidak ada password atau hash yang dicatat dalam log sistem.");
  console.log("• Anda sekarang dapat masuk melalui: /admin/login\n");
}

main()
  .catch((err) => {
    console.error("\n❌ [FATAL ERROR]:", err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

