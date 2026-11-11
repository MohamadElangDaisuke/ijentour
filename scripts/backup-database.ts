import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

async function backup() {
  console.log("=================================================================");
  console.log("     SUPABASE POSTGRESQL PRE-EXECUTION FULL DATA BACKUP          ");
  console.log("=================================================================\n");

  const backupDir = path.join(process.cwd(), "prisma", "backup");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `supabase_backup_${timestamp}.json`);

  const summary: Record<string, number> = {};
  const data: Record<string, any[]> = {};

  const models: (keyof typeof prisma)[] = [
    "user",
    "tripPackage",
    "tripSchedule",
    "booking",
    "destination",
    "galleryItem",
    "blogPost",
    "contact",
    "notification",
    "faq",
    "review",
    "staff",
  ];

  for (const model of models) {
    try {
      if (typeof (prisma as any)[model]?.findMany === "function") {
        const rows = await (prisma as any)[model].findMany();
        summary[String(model)] = rows.length;
        data[String(model)] = rows;
      }
    } catch (err: any) {
      // Fallback: try raw query for pre-migration tables
      try {
        const tableName = model === "user" ? "users" : model === "review" ? "reviews" : model === "staff" ? "staff" : String(model);
        const rawRows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "${tableName}"`);
        summary[String(model)] = rawRows.length;
        data[String(model)] = rawRows;
        console.log(`[Raw Query Backup Sukses]: ${tableName} (${rawRows.length} baris)`);
      } catch (rawErr: any) {
        summary[String(model)] = 0;
        data[String(model)] = [];
        console.warn(`[Tabel Belum Dibuat di DB]: ${String(model)} (${rawErr.message})`);
      }
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), "utf8");

  console.log(`✅ Backup tersimpan aman: ${backupFile}`);
  console.log("\nRingkasan Data Eksisting di Supabase Saat Ini:");
  console.table(summary);

  // Check if target accounts exist
  const existingUsers = data["user"] || [];
  const targetEmail = "elangdaisuke544@gmail.com";
  const targetUsername = "superadmin";

  const emailConflict = existingUsers.find((u: any) => u.email?.toLowerCase() === targetEmail);
  const usernameConflict = existingUsers.find((u: any) => u.username?.toLowerCase() === targetUsername);
  const superAdminExists = existingUsers.find((u: any) => u.role === "SUPER_ADMIN");

  console.log("\n--- PEMERIKSAAN TARGET SUPER ADMIN ---");
  console.log(`• Target Email ('${targetEmail}'):`, emailConflict ? `SUDAH ADA (ID: ${emailConflict.id}, Role: ${emailConflict.role})` : "BELUM ADA (AMAN)");
  console.log(`• Target Username ('${targetUsername}'):`, usernameConflict ? `SUDAH ADA (ID: ${usernameConflict.id})` : "BELUM ADA (AMAN)");
  console.log(`• Akun Super Admin Eksisting:`, superAdminExists ? `DITEMUKAN (${superAdminExists.email})` : "BELUM ADA");

  return { backupFile, summary, emailConflict, usernameConflict, superAdminExists };
}

backup()
  .catch((err) => {
    console.error("Backup gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
