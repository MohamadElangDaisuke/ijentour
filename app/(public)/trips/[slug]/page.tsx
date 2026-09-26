import { redirect } from "next/navigation";
import { defaultPackages } from "@/app/lib/packagesStorage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TripSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const found = defaultPackages.find((p) => p.id === slug || p.id === `pkg-${slug}` || p.title.toLowerCase().includes(slug.toLowerCase()));
  if (found) {
    redirect(`/packages/${found.id}`);
  }
  redirect(`/packages/${slug}`);
}
