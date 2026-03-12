import type { Metadata } from "next";
import { GalleryDirectoryView } from "@/components/gallery/GalleryDirectoryView";
import { getGalleryTrips } from "@/lib/gallery";
import { siteConfig } from "@/lib/site";

const galleryDescription = "A curated directory of travel photography from Riza Satyabudhi.";

export const metadata: Metadata = {
  title: "Gallery",
  description: galleryDescription,
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: `Gallery | ${siteConfig.name}`,
    description: galleryDescription,
    url: `${siteConfig.url}/gallery`,
  },
};

export default function GalleryPage() {
  const trips = getGalleryTrips();

  return <GalleryDirectoryView trips={trips} />;
}
