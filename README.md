# 🌋 Ijen Tour — Fullstack Travel Platform

Platform web resmi pemesanan tur ekspedisi Kawah Ijen Banyuwangi lengkap dengan portal multi-role (Admin, Customer, Customer Pro VIP, Mitra Tour Guide), manajemen paket wisata, artikel panduan, galeri momen, dan pelacakan reservasi booking.

---

## 🚀 Panduan Deploy ke Vercel

### 1. Push ke GitHub
Pastikan semua perubahan telah di-commit dan di-push ke repository GitHub:
```bash
git add .
git commit -m "feat: complete vercel deployment setup & fullstack features"
git push origin main
```

### 2. Import Project di Vercel Dashboard
1. Buka [vercel.com/new](https://vercel.com/new).
2. Pilih repository GitHub: `mount-ijen` (atau repository Anda).
3. Framework Preset: **Next.js** (terdeteksi otomatis dari `vercel.json`).
4. Root Directory: `./` (atau pilih folder project jika monorepo).

### 3. Environment Variables di Vercel (Project Settings > Environment Variables)
Tambahkan variabel lingkungan berikut:

| Key | Value Contoh | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | `file:./dev.db` | URL database (SQLite default sudah dibundle bersama seed data, atau gunakan PostgreSQL Supabase/Neon jika ingin database cloud) |
| `JWT_SECRET` | `ijen-tour-secret-key-super-secure-fullstack-2026` | Kunci rahasia enkripsi token sesi login |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | URL domain Vercel Anda |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | URL domain publik |
| `ADMIN_WHATSAPP_NUMBER` | `6282268177188` | Nomor WhatsApp admin untuk pemesanan langsung |

### 4. Build & Output Settings
- **Build Command**: `prisma generate && next build` (sudah tersetel otomatis di `package.json`).
- **Install Command**: `npm install` (akan mengeksekusi `prisma generate` via `postinstall`).

---

## 👥 Akun Demo untuk Pengujian di Vercel

| Role | Email | Password | Akses Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ijentour.com` | `admin123` | `/admin/dashboard` |
| **Customer Pro** | `pro@ijentour.com` | `customer123` | `/customer` (Diskon 10% otomatis) |
| **Customer** | `john@example.com` | `customer123` | `/customer` |
| **Mitra Guide** | `mitra@ijentour.com` | `mitra123` | `/mitra` |

---

## 🛠️ Perintah Lokal
```bash
# Jalankan server pengembangan
npm run dev

# Buat build produksi
npm run build

# Seed ulang database lokal
npm run db:seed
```
