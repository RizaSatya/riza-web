# Gallery Directory Redesign

Date: 2026-03-12
Status: Approved in conversation, written for review

## Summary

Refactor the current `/gallery` page from a full-image archive into a curated directory page. The landing page should feature one manually selected trip, then list the remaining gallery folders as lightweight cover cards. Each folder should get its own dedicated route at `/gallery/[slug]`, where visitors can browse the full image set for that trip.

This keeps the landing page faster and calmer while preserving the immersive photo-viewing experience on trip-level pages.

## Goals

- Reduce the initial visual and loading cost of `/gallery`.
- Give the gallery landing page a clearer editorial hierarchy.
- Let each folder/trip feel like its own destination with a dedicated page.
- Keep content management filesystem-based and easy to maintain.
- Allow manual control over which folder is featured without introducing a CMS.

## Non-Goals

- No database, upload UI, or admin panel.
- No per-image metadata files in this iteration.
- No manual cover-image selection in this iteration.
- No cross-trip pagination or previous/next trip navigation yet.
- No filtering or search yet.

## User Experience

### `/gallery` Landing Page

The landing page becomes a directory, not the full archive.

It should include:

- A page intro consistent with the site tone.
- One featured trip section at the top.
- A directory grid of the remaining trips below.

The featured section should include:

- A large cover image.
- The trip title.
- A short supporting line or compact metadata such as image count.
- A clear call-to-action linking to the trip detail page.

The directory cards should include:

- One cover image per folder.
- The folder title.
- The image count.
- A link to the trip detail page.

This page should feel like an editorial index: image-led, but controlled and easy to scan.

### `/gallery/[slug]` Trip Page

Each folder should render on its own dedicated page.

The page should include:

- A trip header with title and image count.
- A back link to `/gallery`.
- The full image set for that trip.
- The existing immersive browsing treatment, including the lightbox behavior already built for the current gallery page.

This route becomes the place where all images in the folder are shown.

## Content Model

### Source of Truth

The source of truth remains `public/images/gallery/`.

- Each top-level folder represents one gallery trip.
- Each valid image file inside that folder belongs to the trip.
- A hidden marker file named `.featured` inside a folder marks that trip as the featured one for `/gallery`.

Example:

```text
public/images/gallery/
  rome-italy-winter-2024/
    .featured
    01.jpg
    02.jpg
  florence-italy-winter-2024/
    01.jpg
    02.jpg
```

### Derived Fields

For the landing page, each folder should derive:

- `slug`
- `title`
- `coverImage`
- `imageCount`
- `isFeatured`

For the trip detail page, each folder should derive:

- `slug`
- `title`
- `images`
- `imageCount`
- `isFeatured`

`coverImage` should default to the first valid image after deterministic filename sorting.

### Featured Selection Rules

- If exactly one folder contains `.featured`, that folder is featured.
- If multiple folders contain `.featured`, choose the first valid folder after sorting and ignore the others.
- If no folder contains `.featured`, fall back to the first valid folder after sorting.

This keeps editorial control simple while preserving stable behavior in accidental edge cases.

## Architecture

### Data Layer

Extend `lib/gallery.ts` so it can support both listing and detail routes.

Responsibilities:

- Read the gallery root.
- Filter to valid directories.
- Read image files within each folder.
- Ignore unsupported files and marker files.
- Detect `.featured`.
- Produce normalized folder metadata for the landing page.
- Return full image arrays for detail pages.
- Look up one folder by slug for `/gallery/[slug]`.

The data layer should stay responsible for filesystem concerns and derived gallery metadata, keeping route components presentation-focused.

### Route Layer

Add or reshape routes as follows:

- `app/gallery/page.tsx`
  - renders the featured trip and directory grid
- `app/gallery/[slug]/page.tsx`
  - renders a single trip and its full images
  - handles missing slugs cleanly, ideally via `notFound()`

### Presentation Units

The current `GalleryView` likely does too much for the new information architecture. The design should split the UI into smaller pieces with clear roles, such as:

- landing-page shell
- featured trip block
- directory card grid
- trip detail gallery view
- lightbox viewer

The exact file boundaries can follow repo conventions, but the responsibilities should remain separate.

## Data Flow

### Landing Page

1. `/gallery` calls the gallery listing helper.
2. The helper scans folders, images, and `.featured` markers.
3. The helper returns one featured trip plus the remaining trips.
4. The route renders the featured section first, then the directory cards.

### Trip Page

1. `/gallery/[slug]` calls a folder lookup helper with the slug.
2. The helper returns full data for that folder or `null`.
3. The route renders the trip page or a not-found state.

## Error Handling And Edge Cases

- If `public/images/gallery/` does not exist, the landing page should render the existing empty-state pattern.
- If a folder contains no valid images, skip it.
- Ignore unsupported files silently.
- Ignore `.featured` when building image arrays.
- If a slug does not match a valid folder, return a proper not-found response.
- If the featured folder is skipped because it has no valid images, fall back to the first remaining valid folder.

## Visual Design

The redesign should preserve the existing site visual language:

- Terminal Luxe typography and spacing
- restrained accent usage
- cinematic image-first presentation

The landing page should feel more composed than the current full archive:

- stronger top-of-page focal point
- calmer grid rhythm
- less image density

The trip page can stay closer to the current gallery experience, since that is where full immersion belongs.

## Accessibility

- Every rendered image must have non-empty alt text.
- Featured and directory links must remain clear on keyboard focus.
- Heading hierarchy should remain semantic across landing and detail pages.
- Back navigation from a trip page should be obvious and keyboard accessible.
- The landing page must remain useful on mobile without overwhelming vertical density.

## SEO And Metadata

### `/gallery`

- Keep route metadata for the gallery landing page.
- Update the description if needed so it reflects the directory/discovery role.

### `/gallery/[slug]`

- Generate metadata per trip using the folder title.
- Include canonical URLs for each trip page.
- Reuse site naming conventions for titles and Open Graph values.

## Testing Strategy

Primary test coverage should stay focused on `lib/gallery.ts`, with targeted component coverage where it adds confidence.

### Loader Tests

- Returns an empty array when the gallery root is missing.
- Skips non-directory entries.
- Skips empty folders.
- Ignores unsupported files.
- Ignores `.featured` as an image file.
- Detects the featured folder correctly.
- Falls back correctly when no folder is featured.
- Handles multiple `.featured` markers deterministically.
- Derives cover image and image counts correctly.
- Returns the correct folder for a slug lookup.

### Route / Component Verification

- `/gallery` renders the featured trip separately from the rest of the directory.
- `/gallery/[slug]` renders the selected trip’s images.
- Missing slugs produce the expected not-found behavior.

## Open Decisions Deferred

- Whether to support manual cover-image overrides later.
- Whether to infer richer metadata like location/date labels from folder names.
- Whether trip pages should later include previous/next trip navigation.

## Recommended Next Planning Step

The implementation plan should focus on:

1. extending the gallery data model
2. splitting landing and detail routes
3. reusing the existing lightbox/gallery behavior on the trip page
4. updating tests for the new data flow
