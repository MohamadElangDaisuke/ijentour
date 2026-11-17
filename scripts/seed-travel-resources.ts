import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_TRAVEL_RESOURCES } from "../lib/travel-resources-defaults";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Travel Planning Resources...");

  for (const resource of DEFAULT_TRAVEL_RESOURCES) {
    const result = await prisma.travelResource.upsert({
      where: { slug: resource.slug },
      update: {
        title: resource.title,
        description: resource.description,
        category: resource.category,
        icon: resource.icon,
        link: resource.link,
        items: JSON.stringify(resource.items),
        sortOrder: resource.sortOrder,
        isActive: resource.isActive,
      },
      create: {
        title: resource.title,
        slug: resource.slug,
        description: resource.description,
        category: resource.category,
        icon: resource.icon,
        link: resource.link,
        items: JSON.stringify(resource.items),
        sortOrder: resource.sortOrder,
        isActive: resource.isActive,
      },
    });
    console.log(`  - Upserted [${result.sortOrder}] ${result.slug}: ${result.title}`);
  }

  const total = await prisma.travelResource.count();
  console.log(`Done. Total travel_resources rows in database: ${total}`);
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

