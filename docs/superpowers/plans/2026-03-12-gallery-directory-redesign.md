# Gallery Directory Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/gallery` into a curated directory with one manually featured trip and add `/gallery/[slug]` detail pages that render each folder’s full image set.

**Architecture:** Refactor the gallery data layer so it can return both directory-friendly trip summaries and full trip detail records, using a `.featured` marker file for manual editorial control. Split the UI into a landing-page view and a trip-detail view, reuse the existing lightbox behavior on the trip page, and add dynamic route metadata plus sitemap entries for gallery detail pages.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Vitest, Testing Library, Node `fs`/`path`

---

## File Structure

- Modify: `lib/gallery.ts`
- Modify: `lib/gallery.test.ts`
- Modify: `app/gallery/page.tsx`
- Create: `app/gallery/[slug]/page.tsx`
- Modify: `components/gallery/GalleryView.tsx`
- Modify: `components/gallery/GalleryView.test.tsx`
- Create: `components/gallery/GalleryDirectoryView.tsx`
- Create: `components/gallery/GalleryDirectoryView.test.tsx`
- Modify: `app/sitemap.ts`

File responsibilities:

- `lib/gallery.ts`: Own filesystem scanning, `.featured` detection, cover-image derivation, summary/detail data shaping, and slug lookup.
- `lib/gallery.test.ts`: Lock down marker handling, cover-image selection, slug lookup, fallback rules, and invalid-folder behavior.
- `app/gallery/page.tsx`: Render the curated gallery landing page from loader data.
- `app/gallery/[slug]/page.tsx`: Render a single trip page, generate metadata/static params, and return `notFound()` for unknown slugs.
- `components/gallery/GalleryDirectoryView.tsx`: Render the featured trip block, directory card grid, and empty state for `/gallery`.
- `components/gallery/GalleryDirectoryView.test.tsx`: Verify featured-vs-directory rendering, image counts, and empty-state behavior.
- `components/gallery/GalleryView.tsx`: Narrow scope to the trip detail experience and keep the existing lightbox interaction.
- `components/gallery/GalleryView.test.tsx`: Verify the detail page gallery wall and lightbox behavior against a single trip payload.
- `app/sitemap.ts`: Include `/gallery` and `/gallery/[slug]` URLs in the sitemap.

## Chunk 1: Refactor The Gallery Data Layer

### Task 1: Expand loader tests to describe the new gallery contract

**Files:**
- Modify: `lib/gallery.test.ts`
- Test: `lib/gallery.test.ts`

- [ ] **Step 1: Write the failing tests for featured selection and summary/detail data**

Update `lib/gallery.test.ts` to replace the current `getGallerySections` assertions with trip-oriented tests. Cover at least these cases:

```ts
describe("getGalleryTrips", () => {
  it("derives coverImage, imageCount, and isFeatured from folder contents", () => {
    const root = makeTempGallery();

    writeFile(path.join(root, "rome-italy-winter-2024", ".featured"));
    writeFile(path.join(root, "rome-italy-winter-2024", "02.jpg"));
    writeFile(path.join(root, "rome-italy-winter-2024", "01.jpg"));
    writeFile(path.join(root, "florence-italy-winter-2024", "01.jpg"));

    expect(getGalleryTrips(root)).toEqual([
      {
        slug: "florence-italy-winter-2024",
        title: "Florence Italy Winter 2024",
        imageCount: 1,
        isFeatured: false,
        coverImage: {
          src: "/images/gallery/florence-italy-winter-2024/01.jpg",
          alt: "Florence Italy Winter 2024 photo 1",
        },
        images: [{ src: "/images/gallery/florence-italy-winter-2024/01.jpg", alt: "Florence Italy Winter 2024 photo 1" }],
      },
      {
        slug: "rome-italy-winter-2024",
        title: "Rome Italy Winter 2024",
        imageCount: 2,
        isFeatured: true,
        coverImage: {
          src: "/images/gallery/rome-italy-winter-2024/01.jpg",
          alt: "Rome Italy Winter 2024 photo 1",
        },
        images: [
          { src: "/images/gallery/rome-italy-winter-2024/01.jpg", alt: "Rome Italy Winter 2024 photo 1" },
          { src: "/images/gallery/rome-italy-winter-2024/02.jpg", alt: "Rome Italy Winter 2024 photo 2" },
        ],
      },
    ]);
  });
});

describe("getGalleryTripBySlug", () => {
  it("returns the matching trip and null for unknown slugs", () => {
    const root = makeTempGallery();
    writeFile(path.join(root, "rome-italy-winter-2024", "01.jpg"));

    expect(getGalleryTripBySlug("rome-italy-winter-2024", root)?.slug).toBe(
      "rome-italy-winter-2024"
    );
    expect(getGalleryTripBySlug("missing-trip", root)).toBeNull();
  });
});
```

Also add explicit tests for:

- no `.featured` marker falls back to the first valid folder
- multiple `.featured` markers resolve deterministically
- `.featured` is ignored as an image file
- empty folders are skipped even if they contain `.featured`

- [ ] **Step 2: Run the loader test file and verify it fails**

Run: `npm test -- lib/gallery.test.ts`

Expected: FAIL with missing exports or mismatched data shape because `lib/gallery.ts` still returns section-based data.

- [ ] **Step 3: Commit the failing-test milestone**

Run:

```bash
git add lib/gallery.test.ts
git commit -m "test: define gallery directory loader behavior"
```

Expected: one commit containing only the new loader expectations.

### Task 2: Implement the richer gallery loader

**Files:**
- Modify: `lib/gallery.ts`
- Test: `lib/gallery.test.ts`

- [ ] **Step 1: Add the new types and exports**

Refactor `lib/gallery.ts` around a trip model:

```ts
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

export function getGalleryTrips(rootDir = DEFAULT_GALLERY_ROOT): GalleryTrip[] {
  // scan directories, build image arrays, mark candidates with hasFeaturedMarker
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
```

Implementation rules:

- treat `.featured` as a marker, not an image
- keep filename sorting deterministic
- build `coverImage` from the first valid image
- compute `imageCount` from `images.length`
- choose exactly one featured trip after sorting

- [ ] **Step 2: Run the loader tests and verify they pass**

Run: `npm test -- lib/gallery.test.ts`

Expected: PASS for all gallery loader cases, including featured fallback and slug lookup.

- [ ] **Step 3: Commit the loader refactor**

Run:

```bash
git add lib/gallery.ts lib/gallery.test.ts
git commit -m "feat: add gallery trip loader"
```

Expected: one commit containing the new loader contract and passing tests.

## Chunk 2: Build The Curated `/gallery` Landing Page

### Task 3: Write landing-page component tests first

**Files:**
- Create: `components/gallery/GalleryDirectoryView.test.tsx`
- Test: `components/gallery/GalleryDirectoryView.test.tsx`

- [ ] **Step 1: Write the failing component tests**

Create `components/gallery/GalleryDirectoryView.test.tsx` with cases for:

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GalleryDirectoryView } from "@/components/gallery/GalleryDirectoryView";
import type { GalleryTrip } from "@/lib/gallery";

const trips: GalleryTrip[] = [
  {
    slug: "rome-italy-winter-2024",
    title: "Rome Italy Winter 2024",
    imageCount: 2,
    isFeatured: true,
    coverImage: {
      src: "/images/gallery/rome-italy-winter-2024/01.jpg",
      alt: "Rome Italy Winter 2024 photo 1",
    },
    images: [
      { src: "/images/gallery/rome-italy-winter-2024/01.jpg", alt: "Rome Italy Winter 2024 photo 1" },
      { src: "/images/gallery/rome-italy-winter-2024/02.jpg", alt: "Rome Italy Winter 2024 photo 2" },
    ],
  },
  {
    slug: "florence-italy-winter-2024",
    title: "Florence Italy Winter 2024",
    imageCount: 1,
    isFeatured: false,
    coverImage: {
      src: "/images/gallery/florence-italy-winter-2024/01.jpg",
      alt: "Florence Italy Winter 2024 photo 1",
    },
    images: [{ src: "/images/gallery/florence-italy-winter-2024/01.jpg", alt: "Florence Italy Winter 2024 photo 1" }],
  },
];

it("renders the featured trip separately from the directory cards", () => {
  render(<GalleryDirectoryView trips={trips} />);

  expect(screen.getByRole("heading", { name: /travel photography/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Rome Italy Winter 2024" })).toBeInTheDocument();

  const directory = screen.getByRole("region", { name: /all journeys/i });
  expect(within(directory).getByRole("link", { name: /florence italy winter 2024/i })).toHaveAttribute(
    "href",
    "/gallery/florence-italy-winter-2024"
  );
});
```

Add a second test for the empty state when `trips=[]`.

- [ ] **Step 2: Run the landing-page tests and verify they fail**

Run: `npm test -- components/gallery/GalleryDirectoryView.test.tsx`

Expected: FAIL because the component does not exist yet.

- [ ] **Step 3: Commit the failing-test milestone**

Run:

```bash
git add components/gallery/GalleryDirectoryView.test.tsx
git commit -m "test: define gallery landing page behavior"
```

Expected: one commit containing only the new landing-page tests.

### Task 4: Implement the landing-page view and route

**Files:**
- Create: `components/gallery/GalleryDirectoryView.tsx`
- Modify: `app/gallery/page.tsx`
- Test: `components/gallery/GalleryDirectoryView.test.tsx`
- Test: `lib/gallery.test.ts`

- [ ] **Step 1: Build the directory view component**

Create `components/gallery/GalleryDirectoryView.tsx` with a server-component-friendly API:

```tsx
import Image from "next/image";
import Link from "next/link";
import { getFeaturedGalleryTrip, type GalleryTrip } from "@/lib/gallery";

type GalleryDirectoryViewProps = {
  trips: GalleryTrip[];
};

export function GalleryDirectoryView({ trips }: GalleryDirectoryViewProps) {
  const featuredTrip = getFeaturedGalleryTrip(trips);
  const otherTrips = trips.filter((trip) => trip.slug !== featuredTrip?.slug);

  // render intro, featured block, "All journeys" region, and empty state
}
```

Minimum UI requirements:

- featured block links to `/gallery/[slug]`
- directory cards render only one image per trip
- image count is visible in both featured and card treatments
- empty state copy matches the current tone

- [ ] **Step 2: Update the `/gallery` route to use the new loader and view**

Update `app/gallery/page.tsx` to call `getGalleryTrips()` and render `GalleryDirectoryView`. Keep route metadata but revise the description to match the directory/discovery role.

```ts
import { GalleryDirectoryView } from "@/components/gallery/GalleryDirectoryView";
import { getGalleryTrips } from "@/lib/gallery";

export default function GalleryPage() {
  return <GalleryDirectoryView trips={getGalleryTrips()} />;
}
```

- [ ] **Step 3: Run the landing-page and loader tests**

Run: `npm test -- lib/gallery.test.ts components/gallery/GalleryDirectoryView.test.tsx`

Expected: PASS for the loader and landing-page component tests.

- [ ] **Step 4: Commit the landing page**

Run:

```bash
git add app/gallery/page.tsx components/gallery/GalleryDirectoryView.tsx components/gallery/GalleryDirectoryView.test.tsx lib/gallery.ts
git commit -m "feat: add curated gallery landing page"
```

Expected: one commit with the landing page wired to the new trip loader.

## Chunk 3: Add `/gallery/[slug]` Trip Pages And Reuse The Lightbox

### Task 5: Rewrite the detail-view tests around a single trip

**Files:**
- Modify: `components/gallery/GalleryView.test.tsx`
- Test: `components/gallery/GalleryView.test.tsx`

- [ ] **Step 1: Update the failing tests to target one trip instead of multiple sections**

Refactor `components/gallery/GalleryView.test.tsx` so the component takes a single `GalleryTrip` prop. Keep the lightbox assertions, but change the render helper to:

```tsx
const trip: GalleryTrip = {
  slug: "rome-italy-winter-2024",
  title: "Rome Italy Winter 2024",
  imageCount: 3,
  isFeatured: true,
  coverImage: {
    src: "/images/gallery/rome-italy-winter-2024/01.jpg",
    alt: "Rome Italy Winter 2024 photo 1",
  },
  images: [
    { src: "/images/gallery/rome-italy-winter-2024/01.jpg", alt: "Rome Italy Winter 2024 photo 1" },
    { src: "/images/gallery/rome-italy-winter-2024/02.jpg", alt: "Rome Italy Winter 2024 photo 2" },
    { src: "/images/gallery/rome-italy-winter-2024/03.jpg", alt: "Rome Italy Winter 2024 photo 3" },
  ],
};

render(<GalleryView trip={trip} />);
```

Add one new assertion for the back link:

```tsx
expect(screen.getByRole("link", { name: /back to gallery/i })).toHaveAttribute(
  "href",
  "/gallery"
);
```

- [ ] **Step 2: Run the detail-view test file and verify it fails**

Run: `npm test -- components/gallery/GalleryView.test.tsx`

Expected: FAIL because `GalleryView` still expects `sections`.

- [ ] **Step 3: Commit the failing-test milestone**

Run:

```bash
git add components/gallery/GalleryView.test.tsx
git commit -m "test: define gallery trip page behavior"
```

Expected: one commit containing only the detail-view expectations.

### Task 6: Implement the trip route, metadata, and gallery detail view

**Files:**
- Modify: `components/gallery/GalleryView.tsx`
- Modify: `components/gallery/GalleryView.test.tsx`
- Create: `app/gallery/[slug]/page.tsx`
- Modify: `lib/gallery.ts`
- Test: `components/gallery/GalleryView.test.tsx`
- Test: `lib/gallery.test.ts`

- [ ] **Step 1: Narrow `GalleryView` to the trip-detail contract**

Update `components/gallery/GalleryView.tsx` so it accepts one `GalleryTrip` and keeps the existing lightbox behavior for `trip.images`.

```tsx
type GalleryViewProps = {
  trip: GalleryTrip;
};

export function GalleryView({ trip }: GalleryViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // render trip header, back link, masonry image wall, and lightbox
}
```

UI requirements:

- heading uses the trip title
- visible image count near the header
- back link to `/gallery`
- existing keyboard and button lightbox controls still work

- [ ] **Step 2: Add the dynamic trip route**

Create `app/gallery/[slug]/page.tsx` following the blog route pattern:

```ts
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryView } from "@/components/gallery/GalleryView";
import { getGalleryTripBySlug, getGalleryTrips } from "@/lib/gallery";
import { absoluteUrl, siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getGalleryTrips().map((trip) => ({ slug: trip.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = getGalleryTripBySlug(slug);
  if (!trip) return {};

  return {
    title: `${trip.title} | ${siteConfig.name}`,
    description: `${trip.imageCount} travel photographs from ${trip.title}.`,
    alternates: {
      canonical: `/gallery/${slug}`,
    },
    openGraph: {
      title: `${trip.title} | ${siteConfig.name}`,
      description: `${trip.imageCount} travel photographs from ${trip.title}.`,
      url: absoluteUrl(`/gallery/${slug}`),
      images: [{ url: absoluteUrl(trip.coverImage.src) }],
    },
  };
}

export default async function GalleryTripPage({ params }: PageProps) {
  const { slug } = await params;
  const trip = getGalleryTripBySlug(slug);
  if (!trip) notFound();

  return <GalleryView trip={trip} />;
}
```

- [ ] **Step 3: Run the detail-view and loader tests**

Run: `npm test -- lib/gallery.test.ts components/gallery/GalleryView.test.tsx`

Expected: PASS, including the updated single-trip lightbox behavior.

- [ ] **Step 4: Verify the app still builds with the new route**

Run: `/bin/bash -c "source ~/.nvm/nvm.sh && nvm use v22.1.0 >/dev/null && npm run build"`

Expected: PASS with static generation for `/gallery/[slug]` and no TypeScript errors.

- [ ] **Step 5: Commit the trip-page work**

Run:

```bash
git add app/gallery/[slug]/page.tsx components/gallery/GalleryView.tsx components/gallery/GalleryView.test.tsx lib/gallery.ts
git commit -m "feat: add gallery trip detail pages"
```

Expected: one commit with the dynamic route and reused lightbox gallery.

## Chunk 4: Finish SEO And End-To-End Verification

### Task 7: Add sitemap coverage for gallery routes

**Files:**
- Modify: `app/sitemap.ts`
- Test: `lib/gallery.test.ts`

- [ ] **Step 1: Update the sitemap implementation**

Import the gallery loader and add both the landing page and trip URLs:

```ts
import { getGalleryTrips } from "@/lib/gallery";

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
    // existing posts/tags entries...
  ];
}
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: PASS for `lib/gallery.test.ts`, `components/gallery/GalleryDirectoryView.test.tsx`, and `components/gallery/GalleryView.test.tsx`.

- [ ] **Step 3: Run the production build**

Run: `/bin/bash -c "source ~/.nvm/nvm.sh && nvm use v22.1.0 >/dev/null && npm run build"`

Expected: PASS with `/gallery` and `/gallery/[slug]` included in the app output.

- [ ] **Step 4: Commit the sitemap and verification pass**

Run:

```bash
git add app/sitemap.ts
git commit -m "chore: add gallery routes to sitemap"
```

Expected: one commit containing only the sitemap update after full verification passes.

## Notes For Execution

- Keep `.featured` optional so existing folders continue to work without additional files.
- Do not introduce manual cover-image overrides in this pass; `coverImage` should remain the first sorted image.
- Prefer reusing the current lightbox logic over creating a second viewer implementation.
- If `GalleryView.tsx` becomes hard to read during execution, split the lightbox into a focused helper component before adding more branching logic.
