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
    'reviews'
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

  // Check admin users
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log('\n=== ADMIN USERS ===');
  console.log(admins.map(a => ({ id: a.id, email: a.email, name: a.name, hasPassword: !!a.passwordHash })));

  const dests = await prisma.destination.findMany();
  console.log('\n=== DESTINATIONS ===');
  console.log(dests);
}

auditDb()
  .catch(console.error)
  .finally(() => process.exit(0));
