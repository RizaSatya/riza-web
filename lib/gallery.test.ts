import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createGallerySlug,
  formatGalleryDate,
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

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
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

describe("createGallerySlug", () => {
  it("normalizes punctuation-heavy folder names into URL-safe slugs", () => {
    expect(createGallerySlug("Florence, Italy (Winter 2024)")).toBe(
      "florence-italy-winter-2024"
    );
    expect(createGallerySlug("Bali_Sunrise")).toBe("bali-sunrise");
  });
});

describe("formatGalleryDate", () => {
  it("formats MM-YYYY strings into Month YYYY labels", () => {
    expect(formatGalleryDate("12-2024")).toBe("December 2024");
    expect(formatGalleryDate("02-2025")).toBe("February 2025");
    expect(formatGalleryDate("2024-12")).toBeNull();
  });
});

describe("getGalleryTrips", () => {
  it("returns an empty array when the gallery root is missing", () => {
    expect(getGalleryTrips("/tmp/does-not-exist-gallery")).toEqual([]);
  });

  it("reads metadata.json and sorts trips by order before date", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "README.md"));
    writeFile(path.join(root, "rome-italy-winter-2024", ".featured"));
    writeFile(path.join(root, "rome-italy-winter-2024", "02.jpg"));
    writeFile(path.join(root, "rome-italy-winter-2024", "01.jpg"));
    writeFile(path.join(root, "rome-italy-winter-2024", "notes.txt"));
    writeJson(path.join(root, "rome-italy-winter-2024", "metadata.json"), {
      date: "12-2024",
      order: 2,
    });
    writeFile(path.join(root, "florence-italy-winter-2024", "01.jpg"));
    writeJson(path.join(root, "florence-italy-winter-2024", "metadata.json"), {
      date: "01-2025",
      order: 1,
    });

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
        date: "01-2025",
        displayDate: "January 2025",
        order: 1,
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
        date: "12-2024",
        displayDate: "December 2024",
        order: 2,
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

  it("does not mark any trip as featured when no marker file exists", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "bali-sunrise", "02.jpg"));
    writeFile(path.join(root, "bali-sunrise", "01.jpg"));
    writeFile(path.join(root, "japan-autumn-2025", "01.png"));

    expect(getGalleryTrips(root).map((trip) => [trip.slug, trip.isFeatured])).toEqual([
      ["bali-sunrise", false],
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
        isFeatured: false,
        date: null,
        displayDate: null,
        order: null,
        images: [
          {
            alt: "Rome photo 1",
            src: "/images/gallery/rome/01.jpg",
          },
        ],
      },
    ]);
  });

  it("uses normalized slugs for folders with punctuation in their names", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "Florence, Italy (Winter 2024)", "01.jpg"));
    writeFile(path.join(root, "Rome, Italy (Winter 2024)", "01.jpg"));

    expect(getGalleryTrips(root).map((trip) => trip.slug)).toEqual([
      "florence-italy-winter-2024",
      "rome-italy-winter-2024",
    ]);
  });

  it("skips later folders when slug normalization would collide", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "Bali Sunrise", "01.jpg"));
    writeFile(path.join(root, "bali-sunrise", "01.jpg"));

    expect(getGalleryTrips(root)).toEqual([
      {
        slug: "bali-sunrise",
        title: "Bali Sunrise",
        coverImage: {
          alt: "Bali Sunrise photo 1",
          src: "/images/gallery/Bali Sunrise/01.jpg",
        },
        imageCount: 1,
        isFeatured: false,
        date: null,
        displayDate: null,
        order: null,
        images: [
          {
            alt: "Bali Sunrise photo 1",
            src: "/images/gallery/Bali Sunrise/01.jpg",
          },
        ],
      },
    ]);
  });
});

describe("getGalleryTripBySlug", () => {
  it("returns the matching trip and null for unknown slugs", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "Rome, Italy (Winter 2024)", ".featured"));
    writeFile(path.join(root, "Rome, Italy (Winter 2024)", "01.jpg"));

    expect(getGalleryTripBySlug("rome-italy-winter-2024", root)).toEqual({
      slug: "rome-italy-winter-2024",
      title: "Rome, Italy (Winter 2024)",
      coverImage: {
        alt: "Rome, Italy (Winter 2024) photo 1",
        src: "/images/gallery/Rome, Italy (Winter 2024)/01.jpg",
      },
      imageCount: 1,
      isFeatured: true,
      date: null,
      displayDate: null,
      order: null,
      images: [
        {
          alt: "Rome, Italy (Winter 2024) photo 1",
          src: "/images/gallery/Rome, Italy (Winter 2024)/01.jpg",
        },
      ],
    });
    expect(getGalleryTripBySlug("Rome, Italy (Winter 2024)", root)).toBeNull();
    expect(getGalleryTripBySlug("missing-trip", root)).toBeNull();
  });

  it("sorts unordered trips by metadata date descending, then title", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "Cinque Terre, Italy (Winter 2024)", "01.jpg"));
    writeJson(path.join(root, "Cinque Terre, Italy (Winter 2024)", "metadata.json"), {
      date: "12-2024",
    });
    writeFile(path.join(root, "Florence, Italy (Winter 2024)", "01.jpg"));
    writeJson(path.join(root, "Florence, Italy (Winter 2024)", "metadata.json"), {
      date: "12-2024",
    });
    writeFile(path.join(root, "Rome, Italy (Winter 2024)", "01.jpg"));
    writeJson(path.join(root, "Rome, Italy (Winter 2024)", "metadata.json"), {
      date: "01-2025",
    });

    expect(getGalleryTrips(root).map((trip) => trip.slug)).toEqual([
      "rome-italy-winter-2024",
      "cinque-terre-italy-winter-2024",
      "florence-italy-winter-2024",
    ]);
  });
});
