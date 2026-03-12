import fs from "fs";
import path from "path";

export type GalleryImage = {
  src: string;
  alt: string;
};

export type GalleryTrip = {
  slug: string;
  title: string;
  coverImage: GalleryImage;
  images: GalleryImage[];
  imageCount: number;
  isFeatured: boolean;
};

export type GallerySection = {
  slug: string;
  title: string;
  images: GalleryImage[];
};

const DEFAULT_GALLERY_ROOT = path.join(process.cwd(), "public/images/gallery");
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const FEATURED_MARKER = ".featured";

export function isSupportedGalleryImage(filename: string) {
  return SUPPORTED_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

export function formatGalleryTitle(slug: string) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createGallerySlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

type GalleryTripCandidate = {
  slug: string;
  title: string;
  images: GalleryImage[];
  hasFeaturedMarker: boolean;
};

function getGalleryTripCandidates(rootDir: string): GalleryTripCandidate[] {
  if (!fs.existsSync(rootDir)) return [];

  const seenSlugs = new Set<string>();

  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((directory) => {
      const sectionRoot = path.join(rootDir, directory.name);

      let entries: string[];
      try {
        entries = fs.readdirSync(sectionRoot);
      } catch {
        return [];
      }

      const slug = createGallerySlug(directory.name);
      if (!slug || seenSlugs.has(slug)) return [];

      const title = formatGalleryTitle(directory.name);
      const hasFeaturedMarker = entries.includes(FEATURED_MARKER);
      const images = entries
        .filter(isSupportedGalleryImage)
        .sort((a, b) => a.localeCompare(b))
        .map((filename, index) => ({
          src: `/images/gallery/${directory.name}/${filename}`,
          alt: `${title} photo ${index + 1}`,
        }));

      if (images.length === 0) return [];
      seenSlugs.add(slug);

      return [
        {
          slug,
          title,
          images,
          hasFeaturedMarker,
        },
      ];
    });
}

export function getGalleryTrips(rootDir = DEFAULT_GALLERY_ROOT): GalleryTrip[] {
  const candidates = getGalleryTripCandidates(rootDir);
  const featuredSlug =
    candidates.find((candidate) => candidate.hasFeaturedMarker)?.slug ?? candidates[0]?.slug;

  return candidates.map((candidate) => ({
    slug: candidate.slug,
    title: candidate.title,
    coverImage: candidate.images[0],
    images: candidate.images,
    imageCount: candidate.images.length,
    isFeatured: candidate.slug === featuredSlug,
  }));
}

export function getGalleryTripBySlug(
  slug: string,
  rootDir = DEFAULT_GALLERY_ROOT
): GalleryTrip | null {
  return getGalleryTrips(rootDir).find((trip) => trip.slug === slug) ?? null;
}

export function getFeaturedGalleryTrip(trips: GalleryTrip[]) {
  return trips.find((trip) => trip.isFeatured) ?? trips[0] ?? null;
}

export function getGallerySections(rootDir = DEFAULT_GALLERY_ROOT): GallerySection[] {
  return getGalleryTrips(rootDir).map((trip) => ({
    slug: trip.slug,
    title: trip.title,
    images: trip.images,
  }));
}
