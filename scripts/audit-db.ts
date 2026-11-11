import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function auditDb() {
  console.log('=== AUDIT SUPABASE / PRISMA DATABASE ===');
  
  const tables = [
    'users',
    'trip_packages',
    'trip_schedules',
    'bookings',
    'gallery_items',
    'destinations',
    'blog_posts',
    'contacts',
    'notifications',
    'faqs',
    'reviews',
    'staff',
    'email_verification_otps',
    'audit_logs'
  ];

  for (const table of tables) {
    try {
      const countRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
      const count = countRes[0]?.count ?? 0;
      console.log(`✅ Table "${table}": ${count} records`);
    } catch (err: any) {
      console.log(`❌ Table "${table}": Error - ${err.message}`);
    }
  }

  const admin = await prisma.user.findFirst();
  console.log('\n=== CURRENT USERS IN DB ===');
  console.log({
    id: admin?.id,
    name: admin?.name,
    username: admin?.username,
    email: admin?.email,
    role: admin?.role,
    isActive: admin?.isActive,
    emailVerified: admin?.emailVerified
  });
}

auditDb()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
