# Gallery Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `/gallery` route that auto-loads travel photography images from `public/images/gallery/` and presents them in a journal-style layout.

**Architecture:** Add a filesystem-backed gallery loader in `lib/gallery.ts`, keep the route server-rendered, and extract a small presentation component so loader behavior and gallery rendering can be tested independently. Introduce a minimal Vitest setup because the repo currently has no test runner, then implement the route and nav update with TDD.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Vitest, Testing Library, Node `fs`/`path`

---

## File Structure

- Create: `lib/gallery.ts`
- Create: `components/gallery/GalleryView.tsx`
- Create: `app/gallery/page.tsx`
- Create: `lib/gallery.test.ts`
- Create: `components/gallery/GalleryView.test.tsx`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`
- Modify: `components/layout/Header.tsx`

File responsibilities:

- `lib/gallery.ts`: Read gallery folders, filter/sort files, and derive section/image display data.
- `components/gallery/GalleryView.tsx`: Render the page header, empty state, and journal-style section layouts from supplied data.
- `app/gallery/page.tsx`: Export metadata, call the loader, and pass data into the view component.
- `lib/gallery.test.ts`: Verify filesystem loading, formatting, filtering, and failure handling.
- `components/gallery/GalleryView.test.tsx`: Verify empty-state rendering and section/image output.
- `vitest.config.ts` and `vitest.setup.ts`: Keep test configuration isolated from app code.

## Chunk 1: Test Harness And Gallery Loader

### Task 1: Add test tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Write the failing test runner command expectation**

Add the following test files first so `npm test` has real work to run:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "."),
    },
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", props),
}));
```

Then update `package.json` scripts and dev dependencies:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.7.0",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "jsdom": "^26.1.0",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Run test command to verify it fails before dependencies are installed**

Run: `npm test`

Expected: command fails because `vitest` is not installed yet, or because there are no implementation files referenced by the soon-to-be-added tests.

- [ ] **Step 3: Install the new dev dependencies**

Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

Expected: `package-lock.json` updates with the new test dependencies.

- [ ] **Step 4: Re-run the test command to verify the harness is now executable**

Run: `npm test`

Expected: the command now starts Vitest successfully. It may report that no tests were found yet, which is acceptable at this stage because the first real failing tests are added in Task 2.

- [ ] **Step 5: Commit the harness setup**

Run:

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "test: add vitest harness"
```

Expected: one commit containing only the test harness setup.

### Task 2: Write loader tests first

**Files:**
- Create: `lib/gallery.test.ts`
- Test: `lib/gallery.test.ts`

- [ ] **Step 1: Write the failing loader tests**

Create `lib/gallery.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the loader tests to verify they fail**

Run: `npm test -- lib/gallery.test.ts`

Expected: FAIL with module-not-found or missing-export errors for `@/lib/gallery`.

- [ ] **Step 3: Write the minimal gallery loader implementation**

Create `lib/gallery.ts`:

```ts
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

      const images = entries
        .filter(isSupportedGalleryImage)
        .sort((a, b) => a.localeCompare(b))
        .map((filename, index) => ({
          src: `/images/gallery/${directory.name}/${filename}`,
          alt: `${formatGalleryTitle(directory.name)} photo ${index + 1}`,
        }));

      if (images.length === 0) return [];

      return [
        {
          slug: directory.name,
          title: formatGalleryTitle(directory.name),
          images,
        },
      ];
    });
}
```

- [ ] **Step 4: Run the loader tests to verify they pass**

Run: `npm test -- lib/gallery.test.ts`

Expected: PASS for all loader tests.

- [ ] **Step 5: Commit the loader work**

Run:

```bash
git add lib/gallery.ts lib/gallery.test.ts
git commit -m "feat: add gallery loader"
```

Expected: one commit containing the loader and its tests.

## Chunk 2: Gallery UI And Route

### Task 3: Write the gallery view tests first

**Files:**
- Create: `components/gallery/GalleryView.test.tsx`
- Test: `components/gallery/GalleryView.test.tsx`

- [ ] **Step 1: Write the failing view tests**

Create `components/gallery/GalleryView.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GalleryView } from "@/components/gallery/GalleryView";
import type { GallerySection } from "@/lib/gallery";

describe("GalleryView", () => {
  it("renders an empty state when there are no sections", () => {
    render(<GalleryView sections={[]} />);

    expect(screen.getByRole("heading", { name: /gallery/i })).toBeInTheDocument();
    expect(
      screen.getByText(/travel frames will appear here once images are added/i)
    ).toBeInTheDocument();
  });

  it("renders one section per gallery chapter with images", () => {
    const sections: GallerySection[] = [
      {
        slug: "bali-sunrise",
        title: "Bali Sunrise",
        images: [
          { src: "/images/gallery/bali-sunrise/01.jpg", alt: "Bali Sunrise photo 1" },
          { src: "/images/gallery/bali-sunrise/02.jpg", alt: "Bali Sunrise photo 2" },
          { src: "/images/gallery/bali-sunrise/03.jpg", alt: "Bali Sunrise photo 3" },
        ],
      },
    ];

    render(<GalleryView sections={sections} />);

    expect(screen.getByRole("heading", { name: "Bali Sunrise" })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(3);
    expect(screen.getByAltText("Bali Sunrise photo 1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the view tests to verify they fail**

Run: `npm test -- components/gallery/GalleryView.test.tsx`

Expected: FAIL because `@/components/gallery/GalleryView` does not exist yet.

- [ ] **Step 3: Write the minimal gallery view component**

Create `components/gallery/GalleryView.tsx`:

```tsx
import type { CSSProperties } from "react";
import Image from "next/image";
import type { GallerySection } from "@/lib/gallery";

type GalleryViewProps = {
  sections: GallerySection[];
};

export function GalleryView({ sections }: GalleryViewProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="animate-in" style={{ "--stagger": 0 } as CSSProperties}>
        <p className="font-mono text-sm text-accent">gallery</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Travel Photography
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Fragments from roads, cities, coastlines, and quiet mornings.
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-border bg-card/40 p-8 sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            No journeys yet
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            Travel frames will appear here once images are added to
            `public/images/gallery`.
          </p>
        </div>
      ) : (
        <div className="mt-14 space-y-16 sm:space-y-24">
          {sections.map((section, sectionIndex) => {
            const [leadImage, ...supportingImages] = section.images;

            return (
              <section
                key={section.slug}
                className="animate-in space-y-6"
                style={{ "--stagger": sectionIndex + 1 } as CSSProperties}
              >
                <div className="flex items-center gap-4">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
                    {section.title}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
                  <div className="overflow-hidden rounded-[1.75rem] bg-card/40">
                    <Image
                      src={leadImage.src}
                      alt={leadImage.alt}
                      width={1600}
                      height={1100}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {supportingImages.map((image) => (
                      <div
                        key={image.src}
                        className="overflow-hidden rounded-[1.5rem] bg-card/40"
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={900}
                          height={700}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the view tests to verify they pass**

Run: `npm test -- components/gallery/GalleryView.test.tsx`

Expected: PASS for the empty-state and section-rendering tests.

- [ ] **Step 5: Commit the view component**

Run:

```bash
git add components/gallery/GalleryView.tsx components/gallery/GalleryView.test.tsx
git commit -m "feat: add gallery view"
```

Expected: one commit containing only the gallery presentation component and its tests.

### Task 4: Wire the route and navigation

**Files:**
- Create: `app/gallery/page.tsx`
- Modify: `components/layout/Header.tsx`
- Test: `components/gallery/GalleryView.test.tsx`

- [ ] **Step 1: Write the route integration expectations**

The route should:

- export `metadata` for `/gallery`
- call `getGallerySections()`
- render `<GalleryView sections={sections} />`

The navigation should expose a `Gallery` link between `About` and `Chat` so it appears with the other primary pages.

- [ ] **Step 2: Add the minimal route implementation**

Create `app/gallery/page.tsx`:

```tsx
import type { Metadata } from "next";
import { GalleryView } from "@/components/gallery/GalleryView";
import { getGallerySections } from "@/lib/gallery";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Travel photography from Riza Satyabudhi.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: `Gallery | ${siteConfig.name}`,
    description: "Travel photography from Riza Satyabudhi.",
    url: `${siteConfig.url}/gallery`,
  },
};

export default function GalleryPage() {
  const sections = getGallerySections();

  return <GalleryView sections={sections} />;
}
```

Update the nav items in `components/layout/Header.tsx`:

```ts
const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/chat", label: "Chat" },
  { href: "/blog", label: "Blog" },
  { href: "/tags", label: "Tags" },
];
```

- [ ] **Step 3: Run focused tests and a build check**

Run:

```bash
npm test -- lib/gallery.test.ts components/gallery/GalleryView.test.tsx
npm run build
```

Expected:

- Vitest passes for the loader and gallery view tests.
- Next.js build succeeds and includes the new `/gallery` route without type errors.

- [ ] **Step 4: Refactor only if the build or tests expose layout issues**

Allowed refactors:

- adjust responsive classes in `GalleryView`
- extract repeated image card markup into a tiny local helper inside `GalleryView.tsx`

Do not add captions, filters, or lightbox behavior in this step.

- [ ] **Step 5: Commit the route wiring**

Run:

```bash
git add app/gallery/page.tsx components/layout/Header.tsx
git commit -m "feat: add gallery route"
```

Expected: one commit containing the page route and nav update.

## Chunk 3: Final Verification And Content Handshake

### Task 5: Verify end-to-end behavior

**Files:**
- Modify: none unless fixes are required
- Test: `lib/gallery.test.ts`
- Test: `components/gallery/GalleryView.test.tsx`

- [ ] **Step 1: Run the full verification suite**

Run:

```bash
npm test
npm run build
```

Expected:

- all Vitest tests pass
- production build succeeds

- [ ] **Step 2: Manually inspect the gallery path in development**

Run: `npm run dev`

Expected: local dev server starts successfully and `/gallery` renders either:

- the empty state if `public/images/gallery/` has no images, or
- journal-style sections for any folders already present

- [ ] **Step 3: Add sample folders only if manual verification is blocked**

If the page cannot be visually inspected because there are no images yet, add temporary local files under `public/images/gallery/<sample-trip>/` for validation and remove them before committing unless the user wants starter content checked in.

- [ ] **Step 4: Record any follow-up fixes from verification**

If verification reveals issues, write the failing test first, fix the issue minimally, and re-run the relevant commands before continuing.

- [ ] **Step 5: Commit the verified final state**

Run:

```bash
git status --short
```

Expected: if verification required follow-up code changes, commit only those fixes with a focused message such as `fix: polish gallery verification issues`. If no files changed during final verification, do not create an extra commit.

## Chunk 4: Masonry Redesign And Lightbox

### Task 6: Redesign the gallery layout to a tighter editorial masonry grid

**Files:**
- Modify: `components/gallery/GalleryView.tsx`
- Modify: `components/gallery/GalleryView.test.tsx`

- [ ] **Step 1: Write failing tests for the new masonry structure**

Add tests that verify:

- the gallery uses a multi-column masonry-style wrapper instead of the old lead-image/sidebar split
- each image renders as a clickable trigger
- the old stretched-layout marker is no longer required

- [ ] **Step 2: Run the gallery view tests to verify they fail**

Run: `npm test -- components/gallery/GalleryView.test.tsx`

Expected: FAIL because the current component still renders the old split layout and has no clickable lightbox triggers.

- [ ] **Step 3: Implement the masonry-style page layout**

Change the gallery page so each section renders:

- a compact chapter label
- a responsive `columns-*` masonry wrapper for image cards
- cards that keep their own natural proportions and feel dense like a portfolio site

- [ ] **Step 4: Re-run the gallery view tests**

Run: `npm test -- components/gallery/GalleryView.test.tsx`

Expected: PASS for the masonry layout assertions.

### Task 7: Add a lightbox popup for full-image viewing

**Files:**
- Modify: `components/gallery/GalleryView.tsx`
- Modify: `components/gallery/GalleryView.test.tsx`

- [ ] **Step 1: Write failing tests for popup behavior**

Add tests that verify:

- clicking an image opens a dialog
- the dialog shows the selected image
- next/previous controls change the active image
- the close button dismisses the popup

- [ ] **Step 2: Run the gallery view tests to verify they fail**

Run: `npm test -- components/gallery/GalleryView.test.tsx`

Expected: FAIL because the popup interactions do not exist yet.

- [ ] **Step 3: Implement the minimal lightbox behavior**

Add a client-side lightbox with:

- click-to-open image triggers
- modal overlay with selected image
- next/previous buttons
- close button
- keyboard support for `Escape`, `ArrowLeft`, and `ArrowRight`

- [ ] **Step 4: Re-run the view tests and full suite**

Run:

```bash
npm test -- components/gallery/GalleryView.test.tsx
npm test
```

Expected: all gallery tests and the full test suite pass.

- [ ] **Step 5: Run a production build**

Run: `npm run build`

Expected: build succeeds and `/gallery` remains a valid route.
