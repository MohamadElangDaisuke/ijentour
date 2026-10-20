import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { defaultPackages } from "./lib/packagesStorage";
import { defaultDestinations } from "./lib/destinationsStorage";
import { defaultArticles } from "./lib/articlesStorage";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ijentour.vercel.app";
  const now = new Date();

  // Static routes
  const staticRoutes = [
    "",
    "/packages",
    "/custom-package",
    "/destinations",
    "/gallery",
    "/about",
    "/blog",
    "/contact",
    "/booking",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let packageRoutes: any[] = [];
  try {
    const dbPackages = await prisma.tripPackage.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, updatedAt: true },
    });
    if (dbPackages.length > 0) {
      packageRoutes = dbPackages.map((pkg) => ({
        url: `${baseUrl}/packages/${pkg.id}`,
        lastModified: pkg.updatedAt || now,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));
    }
  } catch {}
  if (packageRoutes.length === 0) {
    packageRoutes = defaultPackages.map((pkg) => ({
      url: `${baseUrl}/packages/${pkg.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  }

  let destinationRoutes: any[] = [];
  try {
    const dbDestinations = await prisma.destination.findMany({
      select: { id: true, slug: true, createdAt: true },
    });
    if (dbDestinations.length > 0) {
      destinationRoutes = dbDestinations.map((dest) => ({
        url: `${baseUrl}/destinations/${dest.slug || dest.id.replace("dest-", "")}`,
        lastModified: dest.createdAt || now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {}
  if (destinationRoutes.length === 0) {
    destinationRoutes = defaultDestinations.map((dest) => ({
      url: `${baseUrl}/destinations/${dest.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  }

  let blogRoutes: any[] = [];
  try {
    const dbArticles = await prisma.blogPost.findMany({
      select: { id: true, slug: true, updatedAt: true },
    });
    if (dbArticles.length > 0) {
      blogRoutes = dbArticles.map((article) => ({
        url: `${baseUrl}/blog/${article.slug || article.id}`,
        lastModified: article.updatedAt || now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {}
  if (blogRoutes.length === 0) {
    blogRoutes = defaultArticles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug || article.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  }

  return [...staticRoutes, ...packageRoutes, ...destinationRoutes, ...blogRoutes];
}
