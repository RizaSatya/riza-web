import type { MetadataRoute } from "next";
import { getGalleryTrips } from "@/lib/gallery";
import { getAllPosts } from "@/lib/posts";
import { getAllTags } from "@/lib/tags";

const baseUrl = "https://riza.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const tags = getAllTags();
  const galleryTrips = getGalleryTrips();

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/gallery`, lastModified: new Date() },
    { url: `${baseUrl}/tags`, lastModified: new Date() },
    ...galleryTrips.map((trip) => ({
      url: `${baseUrl}/gallery/${trip.slug}`,
      lastModified: new Date(),
    })),
    ...posts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.frontMatter.date),
    })),
    ...tags.map((t) => ({
      url: `${baseUrl}/tags/${t.tag}`,
      lastModified: new Date(),
    })),
  ];
}
