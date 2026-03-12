import type { Metadata } from "next";
import { GalleryView } from "@/components/gallery/GalleryView";
import { getGallerySections } from "@/lib/gallery";
import { siteConfig } from "@/lib/site";

const galleryDescription = "Travel photography from Riza Satyabudhi.";

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
  const sections = getGallerySections();

  return <GalleryView sections={sections} />;
}
