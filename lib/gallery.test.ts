import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
  formatGalleryTitle,
  getGalleryTripBySlug,
  getGalleryTrips,
  isSupportedGalleryImage,
} from "@/lib/gallery";

const tempDirs: string[] = [];

function makeTempGallery() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gallery-test-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, "stub");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("isSupportedGalleryImage", () => {
  it("accepts common image extensions", () => {
    expect(isSupportedGalleryImage("hero.jpg")).toBe(true);
    expect(isSupportedGalleryImage("portrait.jpeg")).toBe(true);
    expect(isSupportedGalleryImage("street.png")).toBe(true);
    expect(isSupportedGalleryImage("night.webp")).toBe(true);
  });

  it("rejects unsupported files", () => {
    expect(isSupportedGalleryImage("notes.txt")).toBe(false);
    expect(isSupportedGalleryImage("raw.heic")).toBe(false);
  });
});

describe("formatGalleryTitle", () => {
  it("formats hyphenated and underscored folder names", () => {
    expect(formatGalleryTitle("japan-autumn-2025")).toBe("Japan Autumn 2025");
    expect(formatGalleryTitle("bali_sunrise")).toBe("Bali Sunrise");
  });
});

describe("getGalleryTrips", () => {
  it("returns an empty array when the gallery root is missing", () => {
    expect(getGalleryTrips("/tmp/does-not-exist-gallery")).toEqual([]);
  });

  it("derives cover images, image counts, and featured state from folder contents", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "README.md"));
    writeFile(path.join(root, "rome-italy-winter-2024", ".featured"));
    writeFile(path.join(root, "rome-italy-winter-2024", "02.jpg"));
    writeFile(path.join(root, "rome-italy-winter-2024", "01.jpg"));
    writeFile(path.join(root, "rome-italy-winter-2024", "notes.txt"));
    writeFile(path.join(root, "florence-italy-winter-2024", "01.jpg"));

    expect(getGalleryTrips(root)).toEqual([
      {
        slug: "florence-italy-winter-2024",
        title: "Florence Italy Winter 2024",
        coverImage: {
          alt: "Florence Italy Winter 2024 photo 1",
          src: "/images/gallery/florence-italy-winter-2024/01.jpg",
        },
        imageCount: 1,
        isFeatured: false,
        images: [
          {
            alt: "Florence Italy Winter 2024 photo 1",
            src: "/images/gallery/florence-italy-winter-2024/01.jpg",
          },
        ],
      },
      {
        slug: "rome-italy-winter-2024",
        title: "Rome Italy Winter 2024",
        coverImage: {
          alt: "Rome Italy Winter 2024 photo 1",
          src: "/images/gallery/rome-italy-winter-2024/01.jpg",
        },
        imageCount: 2,
        isFeatured: true,
        images: [
          {
            alt: "Rome Italy Winter 2024 photo 1",
            src: "/images/gallery/rome-italy-winter-2024/01.jpg",
          },
          {
            alt: "Rome Italy Winter 2024 photo 2",
            src: "/images/gallery/rome-italy-winter-2024/02.jpg",
          },
        ],
      },
    ]);
  });

  it("falls back to the first valid folder when no trip is marked as featured", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "bali-sunrise", "02.jpg"));
    writeFile(path.join(root, "bali-sunrise", "01.jpg"));
    writeFile(path.join(root, "japan-autumn-2025", "01.png"));

    expect(getGalleryTrips(root).map((trip) => [trip.slug, trip.isFeatured])).toEqual([
      ["bali-sunrise", true],
      ["japan-autumn-2025", false],
    ]);
  });

  it("chooses the first sorted featured folder when multiple marker files exist", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "bali-sunrise", ".featured"));
    writeFile(path.join(root, "bali-sunrise", "01.jpg"));
    writeFile(path.join(root, "japan-autumn-2025", ".featured"));
    writeFile(path.join(root, "japan-autumn-2025", "01.jpg"));

    expect(getGalleryTrips(root).map((trip) => [trip.slug, trip.isFeatured])).toEqual([
      ["bali-sunrise", true],
      ["japan-autumn-2025", false],
    ]);
  });

  it("skips empty folders even when they contain a featured marker file", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "empty-featured", ".featured"));
    writeFile(path.join(root, "rome", "01.jpg"));

    expect(getGalleryTrips(root)).toEqual([
      {
        slug: "rome",
        title: "Rome",
        coverImage: {
          alt: "Rome photo 1",
          src: "/images/gallery/rome/01.jpg",
        },
        imageCount: 1,
        isFeatured: true,
        images: [
          {
            alt: "Rome photo 1",
            src: "/images/gallery/rome/01.jpg",
          },
        ],
      },
    ]);
  });
});

describe("getGalleryTripBySlug", () => {
  it("returns the matching trip and null for unknown slugs", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "rome-italy-winter-2024", ".featured"));
    writeFile(path.join(root, "rome-italy-winter-2024", "01.jpg"));

    expect(getGalleryTripBySlug("rome-italy-winter-2024", root)).toEqual({
      slug: "rome-italy-winter-2024",
      title: "Rome Italy Winter 2024",
      coverImage: {
        alt: "Rome Italy Winter 2024 photo 1",
        src: "/images/gallery/rome-italy-winter-2024/01.jpg",
      },
      imageCount: 1,
      isFeatured: true,
      images: [
        {
          alt: "Rome Italy Winter 2024 photo 1",
          src: "/images/gallery/rome-italy-winter-2024/01.jpg",
        },
      ],
    });
    expect(getGalleryTripBySlug("missing-trip", root)).toBeNull();
  });
});
