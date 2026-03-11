# Gallery Page Design

Date: 2026-03-11
Status: Approved for planning review

## Summary

Add a new `/gallery` route for travel photography that automatically loads images from the filesystem and presents them as a journal-style gallery. The first version keeps authoring simple: images only, no metadata files, no CMS, and no captions required.

The gallery should feel like a sequence of travel chapters rather than a uniform media wall. Content is sourced from folders inside `public/images/gallery/`, with each folder becoming one visual section on the page.

## Goals

- Create a dedicated gallery page for travel photography.
- Keep content management lightweight by auto-loading images from folders.
- Match the existing site aesthetic while giving photography more visual emphasis.
- Preserve a path to future enhancements like captions, dates, and locations without reworking the page structure.

## Non-Goals

- No per-image metadata files in the first version.
- No image upload UI or admin workflow.
- No lightbox, filtering, or search in the first version.
- No external image service or database.

## User Experience

### Page Structure

The gallery page will live at `/gallery` and be linked from the main header navigation.

The page layout will include:

- A page intro with a short travel-photography framing.
- A list of gallery sections generated from folders under `public/images/gallery/`.
- A graceful empty state when no valid gallery images are present.

### Journal Presentation

Each subfolder under `public/images/gallery/` represents one travel chapter. For example:

```text
public/images/gallery/
  japan-autumn-2025/
    01.jpg
    02.jpg
  bali-sunrise/
    01.jpg
    02.jpg
```

The folder name is transformed into a readable section heading, such as `Japan Autumn 2025` or `Bali Sunrise`.

Each section will use an editorial layout instead of a strict uniform grid:

- One lead image with higher visual prominence.
- Supporting images arranged in a responsive secondary layout.
- Consistent spacing and section rhythm so each folder reads like a destination entry.

## Content Model

### Source of Truth

The source of truth is the filesystem under `public/images/gallery/`.

- Top-level folders represent sections.
- Files inside each folder represent images in that section.
- Only valid image files are included.

### Supported File Behavior

The loader should recognize common web image extensions already safe for `next/image`, such as:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

Sorting should be deterministic. For the first version, files should be sorted by filename ascending so users can control sequence with names like `01.jpg`, `02.jpg`, and so on.

### Derived Fields

The gallery loader should derive:

- `sectionSlug`: folder name
- `sectionTitle`: human-readable title from the folder name
- `images`: ordered image entries
- `image.src`: public path for `next/image`
- `image.alt`: inferred from filename or section title

Because the first version is image-only, inferred alt text should be simple and consistent, for example using the section title plus index. This is better than leaving alt text empty and gives a baseline accessibility fallback until richer metadata exists.

## Architecture

### Data Layer

Add a new helper in `lib/`, for example `lib/gallery.ts`, to encapsulate all gallery filesystem reading and transformation logic.

Responsibilities:

- Read the gallery root directory.
- Filter to directories only.
- Read image files within each directory.
- Filter unsupported files.
- Sort folders and files deterministically.
- Return a stable data structure for rendering.

This keeps the route component focused on presentation, which matches the existing pattern used for content helpers in `lib/`.

### Route Layer

Add a new route at `app/gallery/page.tsx`.

Responsibilities:

- Export page metadata.
- Call the gallery loader.
- Render the page intro, gallery sections, and empty state.

The route should remain server-rendered and avoid unnecessary client-side state.

### Presentation Units

The implementation may keep the route inline if it stays compact, or extract a focused component if the JSX becomes large. The preferred unit boundaries are:

- `gallery loader`: filesystem access and data shaping
- `gallery page`: page shell and section loop
- `gallery section` component: section heading plus editorial image layout

Each unit has a single purpose and can evolve independently.

## Data Flow

1. At request/render time, the server route calls the gallery loader.
2. The loader scans `public/images/gallery/`.
3. The loader returns a normalized array of sections with ordered images.
4. The route renders each section in sequence.
5. `next/image` serves optimized images for the page.

## Error Handling and Edge Cases

### Missing Gallery Root

If `public/images/gallery/` does not exist, the loader should return an empty array instead of throwing. The page should render a friendly empty state.

### Empty Folders

If a folder contains no valid images, it should be skipped.

### Unsupported Files

Non-image files should be ignored silently.

### Folder Naming

If a folder name is machine-like, the title formatter should still produce a readable heading by splitting common separators such as hyphens or underscores and capitalizing words.

### Broken Assumptions

The loader should use explicit failure rules:

- If the gallery root is missing, return an empty array.
- If one section folder cannot be read, skip that section and continue with the rest.
- If an individual file entry cannot be inspected, ignore that file and continue.

This keeps the gallery page resilient to content mistakes while keeping the error-handling contract simple enough to test.

## Visual Design

The gallery should preserve the site's established visual language:

- Existing typography stack
- Existing dark background and accent palette
- Existing section-label treatment and subtle glow accents

Photography should remain the focal point, so image containers should avoid heavy framing. Decorative UI should stay minimal around the photos.

Section rhythm should feel calmer and more cinematic than the blog listing:

- More generous vertical spacing
- Clear separation between travel chapters
- Responsive editorial layout that feels intentional on desktop and mobile

## SEO and Metadata

The gallery route should export metadata consistent with the rest of the app:

- Title: `Gallery`
- Description tailored to travel photography
- Canonical URL: `/gallery`
- Open Graph title and description for the gallery page

If the project later adds a gallery-specific OG image, the route can be extended without changing the page architecture.

## Accessibility

- Every image must have non-empty alt text, even if derived.
- Section headings should use semantic heading structure.
- Layout must remain usable on mobile widths without horizontal scrolling.
- Visual hierarchy must not rely on accent color alone.

## Testing Strategy

The initial test coverage should focus on the loader because it contains the main behavior.

### Loader Tests

- Returns an empty array when the gallery root is missing.
- Ignores non-directory entries at the root.
- Ignores unsupported file types.
- Skips empty folders.
- Sorts sections and files deterministically.
- Formats folder titles into readable headings.
- Produces stable public image paths and fallback alt text.

### Page-Level Verification

- The gallery page renders the empty state when no sections are returned.
- The gallery page renders one section per loader result.

Implementation planning can decide whether page-level verification is handled with component tests, route rendering tests, or a lighter integration approach that fits the current repo setup.

## Future Extensions

The design intentionally leaves room for later additions without changing the route contract significantly:

- Optional metadata sidecar files
- Captions and location labels
- Section cover images
- Lightbox interactions
- Tag or destination filtering

These are explicitly deferred from the first version.

## Open Decisions for Planning

- Whether to keep the section layout inline in `app/gallery/page.tsx` or extract a `components/gallery/` unit immediately.
- The exact fallback alt text format for image-only content.
- The exact empty-state copy.

These do not block implementation planning because they are localized decisions with low architectural impact.
