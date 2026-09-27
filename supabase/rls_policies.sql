-- ==============================================================================
-- SUPABASE POSTGRESQL - ROW LEVEL SECURITY (RLS) & POLICIES
-- Project: Ijen Tour Fullstack
-- ==============================================================================
--
-- ARSITEKTUR KEAMANAN:
-- 1. Prisma ORM (melalui connection string DATABASE_URL dengan user 'postgres')
--    berjalan di server-side Next.js (Vercel) dan membypass RLS secara default
--    karena bertindak sebagai table owner/superuser.
-- 2. Kebijakan RLS di bawah ini melindungi database dari akses langsung client-side
--    melalui Supabase REST API (menggunakan NEXT_PUBLIC_SUPABASE_ANON_KEY).
-- ==============================================================================

-- 1. AKTIFKAN RLS PADA SEMUA TABEL
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "trip_packages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "trip_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "destinations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "gallery_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "blog_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "faqs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "reviews" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. TABEL SENSITIF (USERS, BOOKINGS, NOTIFICATIONS, CONTACTS)
-- Disallow public anon access! Semua operasi WAJIB melalui Next.js API / Prisma.
-- ------------------------------------------------------------------------------
-- Hapus policy lama jika ada untuk mencegah konflik
DROP POLICY IF EXISTS "Deny anon access on users" ON "users";
DROP POLICY IF EXISTS "Deny anon access on bookings" ON "bookings";
DROP POLICY IF EXISTS "Deny anon access on notifications" ON "notifications";
DROP POLICY IF EXISTS "Deny anon read on contacts" ON "contacts";

-- Tabel users: Hanya bisa diakses server-side (Prisma)
-- Tidak ada SELECT/INSERT/UPDATE/DELETE untuk role 'anon'

-- Tabel bookings: Hanya bisa diakses server-side (Prisma)
-- Tidak ada SELECT/INSERT/UPDATE/DELETE untuk role 'anon'

-- Tabel notifications: Hanya admin via Prisma
-- Tidak ada SELECT/INSERT/UPDATE/DELETE untuk role 'anon'

-- Tabel contacts: Izinkan INSERT publik dari contact form (opsional), tapi tolak SELECT
CREATE POLICY "Allow public insert contacts" ON "contacts"
  FOR INSERT TO anon
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. TABEL KONTEN PUBLIK (READ-ONLY UNTUK PUBLIK, WRITE HANYA ADMIN/SERVER)
-- Publik boleh membaca paket, destinasi, artikel, galeri, faq, review yang aktif.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read active trip_packages" ON "trip_packages";
CREATE POLICY "Allow public read active trip_packages" ON "trip_packages"
  FOR SELECT TO anon
  USING ("isActive" = true);

DROP POLICY IF EXISTS "Allow public read trip_schedules" ON "trip_schedules";
CREATE POLICY "Allow public read trip_schedules" ON "trip_schedules"
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow public read destinations" ON "destinations";
CREATE POLICY "Allow public read destinations" ON "destinations"
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow public read gallery_items" ON "gallery_items";
CREATE POLICY "Allow public read gallery_items" ON "gallery_items"
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow public read blog_posts" ON "blog_posts";
CREATE POLICY "Allow public read blog_posts" ON "blog_posts"
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow public read faqs" ON "faqs";
CREATE POLICY "Allow public read faqs" ON "faqs"
  FOR SELECT TO anon
  USING ("isActive" = true);

DROP POLICY IF EXISTS "Allow public read approved reviews" ON "reviews";
CREATE POLICY "Allow public read approved reviews" ON "reviews"
  FOR SELECT TO anon
  USING ("isApproved" = true);

-- Review submission oleh publik (anon) melalui form ulasan
DROP POLICY IF EXISTS "Allow public insert reviews" ON "reviews";
CREATE POLICY "Allow public insert reviews" ON "reviews"
  FOR INSERT TO anon
  WITH CHECK (true);
