import fs from "fs";
import path from "path";

export type GalleryImage = {
  src: string;
  alt: string;
};

export type GallerySection = {
  slug: string;
  title: string;
  images: GalleryImage[];
};

const DEFAULT_GALLERY_ROOT = path.join(process.cwd(), "public/images/gallery");
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

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

export function getGallerySections(rootDir = DEFAULT_GALLERY_ROOT): GallerySection[] {
  if (!fs.existsSync(rootDir)) return [];

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

      const title = formatGalleryTitle(directory.name);
      const images = entries
        .filter(isSupportedGalleryImage)
        .sort((a, b) => a.localeCompare(b))
        .map((filename, index) => ({
          src: `/images/gallery/${directory.name}/${filename}`,
          alt: `${title} photo ${index + 1}`,
        }));

      if (images.length === 0) return [];

      return [
        {
          slug: directory.name,
          title,
          images,
        },
      ];
    });
}
