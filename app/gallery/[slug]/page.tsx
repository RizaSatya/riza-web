import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryView } from "@/components/gallery/GalleryView";
import { getGalleryTripBySlug, getGalleryTrips } from "@/lib/gallery";
import { absoluteUrl, siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getGalleryTrips().map((trip) => ({ slug: trip.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = getGalleryTripBySlug(slug);

  if (!trip) return {};

  const description = `${trip.imageCount} travel photographs from ${trip.title}.`;

  return {
    title: `${trip.title} | ${siteConfig.name}`,
    description,
    alternates: {
      canonical: `/gallery/${slug}`,
    },
    openGraph: {
      title: `${trip.title} | ${siteConfig.name}`,
      description,
      url: absoluteUrl(`/gallery/${slug}`),
      images: [
        {
          url: absoluteUrl(trip.coverImage.src),
        },
      ],
    },
  };
}

export default async function GalleryTripPage({ params }: PageProps) {
  const { slug } = await params;
  const trip = getGalleryTripBySlug(slug);

  if (!trip) notFound();

  return <GalleryView trip={trip} />;
}
