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
  date: string | null;
  displayDate: string | null;
  order: number | null;
};

export type GallerySection = {
  slug: string;
  title: string;
  images: GalleryImage[];
};

const DEFAULT_GALLERY_ROOT = path.join(process.cwd(), "public/images/gallery");
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const FEATURED_MARKER = ".featured";
const METADATA_FILENAME = "metadata.json";
const GALLERY_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
const GALLERY_FILENAME_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

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

export function formatGalleryDate(value: string) {
  const match = value.match(/^(0[1-9]|1[0-2])-(\d{4})$/);
  if (!match) return null;

  const monthIndex = Number(match[1]) - 1;
  return `${GALLERY_MONTHS[monthIndex]} ${match[2]}`;
}

function createGalleryImageSrc(directoryName: string, filename: string) {
  return `/images/gallery/${encodeURIComponent(directoryName)}/${encodeURIComponent(filename)}`;
}

function compareGalleryFilenames(a: string, b: string) {
  return GALLERY_FILENAME_COLLATOR.compare(a, b);
}

type GalleryMetadata = {
  date: string | null;
  displayDate: string | null;
  order: number | null;
};

function readGalleryMetadata(sectionRoot: string): GalleryMetadata {
  const metadataPath = path.join(sectionRoot, METADATA_FILENAME);
  if (!fs.existsSync(metadataPath)) {
    return {
      date: null,
      displayDate: null,
      order: null,
    };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(metadataPath, "utf8")) as {
      date?: unknown;
      order?: unknown;
    };
    const date = typeof parsed.date === "string" ? parsed.date : null;
    const displayDate = date === null ? null : formatGalleryDate(date);
    const order = typeof parsed.order === "number" && Number.isFinite(parsed.order)
      ? parsed.order
      : null;

    return {
      date: displayDate === null ? null : date,
      displayDate,
      order,
    };
  } catch {
    return {
      date: null,
      displayDate: null,
      order: null,
    };
  }
}

function compareGalleryDates(a: string | null, b: string | null) {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;

  const [aMonth, aYear] = a.split("-").map(Number);
  const [bMonth, bYear] = b.split("-").map(Number);
  const aValue = aYear * 100 + aMonth;
  const bValue = bYear * 100 + bMonth;

  return bValue - aValue;
}

type GalleryTripCandidate = {
  slug: string;
  title: string;
  images: GalleryImage[];
  hasFeaturedMarker: boolean;
  date: string | null;
  displayDate: string | null;
  order: number | null;
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
      const metadata = readGalleryMetadata(sectionRoot);
      const images = entries
        .filter(isSupportedGalleryImage)
        .sort(compareGalleryFilenames)
        .map((filename, index) => ({
          src: createGalleryImageSrc(directory.name, filename),
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
          date: metadata.date,
          displayDate: metadata.displayDate,
          order: metadata.order,
        },
      ];
    });
}

export function getGalleryTrips(rootDir = DEFAULT_GALLERY_ROOT): GalleryTrip[] {
  const candidates = getGalleryTripCandidates(rootDir).sort((a, b) => {
    const aHasOrder = a.order !== null;
    const bHasOrder = b.order !== null;

    if (aHasOrder && bHasOrder) {
      const orderDifference = a.order! - b.order!;
      if (orderDifference !== 0) return orderDifference;
    }

    if (aHasOrder !== bHasOrder) {
      return aHasOrder ? -1 : 1;
    }

    const dateComparison = compareGalleryDates(a.date, b.date);
    if (dateComparison !== 0) return dateComparison;

    return a.title.localeCompare(b.title);
  });
  const featuredSlug = candidates.find((candidate) => candidate.hasFeaturedMarker)?.slug;

  return candidates.map((candidate) => ({
    slug: candidate.slug,
    title: candidate.title,
    coverImage: candidate.images[0],
    images: candidate.images,
    imageCount: candidate.images.length,
    isFeatured: candidate.slug === featuredSlug,
    date: candidate.date,
    displayDate: candidate.displayDate,
    order: candidate.order,
  }));
}

export function getGalleryTripBySlug(
  slug: string,
  rootDir = DEFAULT_GALLERY_ROOT
): GalleryTrip | null {
  return getGalleryTrips(rootDir).find((trip) => trip.slug === slug) ?? null;
}

export function getFeaturedGalleryTrip(trips: GalleryTrip[]) {
  return trips.find((trip) => trip.isFeatured) ?? null;
}

export function getGallerySections(rootDir = DEFAULT_GALLERY_ROOT): GallerySection[] {
  return getGalleryTrips(rootDir).map((trip) => ({
    slug: trip.slug,
    title: trip.title,
    images: trip.images,
  }));
}
