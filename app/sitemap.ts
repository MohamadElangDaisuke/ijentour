import { MetadataRoute } from "next";
import { defaultPackages } from "./lib/packagesStorage";
import { defaultDestinations } from "./lib/destinationsStorage";
import { defaultArticles } from "./lib/articlesStorage";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ijentour.vercel.app";
  const now = new Date();

  // Static routes
  const staticRoutes = [
    "",
    "/packages",
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

  // Dynamic packages
  const packageRoutes = defaultPackages.map((pkg) => ({
    url: `${baseUrl}/packages/${pkg.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Dynamic destinations
  const destinationRoutes = defaultDestinations.map((dest) => ({
    url: `${baseUrl}/destinations/${dest.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic blog articles
  const blogRoutes = defaultArticles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug || article.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...packageRoutes, ...destinationRoutes, ...blogRoutes];
}
