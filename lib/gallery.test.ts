import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
  formatGalleryTitle,
  getGallerySections,
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

describe("getGallerySections", () => {
  it("returns an empty array when the gallery root is missing", () => {
    expect(getGallerySections("/tmp/does-not-exist-gallery")).toEqual([]);
  });

  it("ignores non-directory root entries, skips empty folders, and sorts sections and files", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "README.md"));
    writeFile(path.join(root, "bali-sunrise", "02.jpg"));
    writeFile(path.join(root, "bali-sunrise", "01.jpg"));
    writeFile(path.join(root, "bali-sunrise", "notes.txt"));
    fs.mkdirSync(path.join(root, "empty-folder"), { recursive: true });
    writeFile(path.join(root, "japan-autumn-2025", "03.webp"));
    writeFile(path.join(root, "japan-autumn-2025", "01.png"));

    expect(getGallerySections(root)).toEqual([
      {
        slug: "bali-sunrise",
        title: "Bali Sunrise",
        images: [
          {
            alt: "Bali Sunrise photo 1",
            src: "/images/gallery/bali-sunrise/01.jpg",
          },
          {
            alt: "Bali Sunrise photo 2",
            src: "/images/gallery/bali-sunrise/02.jpg",
          },
        ],
      },
      {
        slug: "japan-autumn-2025",
        title: "Japan Autumn 2025",
        images: [
          {
            alt: "Japan Autumn 2025 photo 1",
            src: "/images/gallery/japan-autumn-2025/01.png",
          },
          {
            alt: "Japan Autumn 2025 photo 2",
            src: "/images/gallery/japan-autumn-2025/03.webp",
          },
        ],
      },
    ]);
  });
});
