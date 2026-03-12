"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { GallerySection } from "@/lib/gallery";

type GalleryViewProps = {
  sections: GallerySection[];
};

type ActiveImage = {
  sectionIndex: number;
  imageIndex: number;
};

export function GalleryView({ sections }: GalleryViewProps) {
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);

  const activeSection =
    activeImage === null ? null : sections[activeImage.sectionIndex];
  const activePhoto =
    activeImage === null || activeSection === null
      ? null
      : activeSection.images[activeImage.imageIndex];

  useEffect(() => {
    if (activeImage === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveImage(null);
      }

      if (event.key === "ArrowRight") {
        setActiveImage((current) => {
          if (current === null) return null;
          const section = sections[current.sectionIndex];
          return {
            ...current,
            imageIndex: (current.imageIndex + 1) % section.images.length,
          };
        });
      }

      if (event.key === "ArrowLeft") {
        setActiveImage((current) => {
          if (current === null) return null;
          const section = sections[current.sectionIndex];
          return {
            ...current,
            imageIndex:
              (current.imageIndex - 1 + section.images.length) % section.images.length,
          };
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage, sections]);

  function moveActiveImage(direction: 1 | -1) {
    setActiveImage((current) => {
      if (current === null) return null;
      const section = sections[current.sectionIndex];

      return {
        ...current,
        imageIndex:
          (current.imageIndex + direction + section.images.length) % section.images.length,
      };
    });
  }

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
            Travel frames will appear here once images are added to `public/images/gallery`.
          </p>
        </div>
      ) : (
        <div className="mt-14 space-y-16 sm:space-y-24">
          {sections.map((section, sectionIndex) => (
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

              <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
                {section.images.map((image, imageIndex) => (
                  <button
                    key={image.src}
                    type="button"
                    aria-label={`Open ${image.alt}`}
                    onClick={() => setActiveImage({ sectionIndex, imageIndex })}
                    className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-[1.5rem] bg-card/40 text-left outline-none transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-8px_var(--glow)] focus-visible:ring-2 focus-visible:ring-accent/60"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={1200}
                      height={1600}
                      className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {activeImage !== null && activePhoto !== null && activeSection !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 p-4 backdrop-blur-md sm:p-6"
          onClick={() => setActiveImage(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="w-full max-w-6xl rounded-[2rem] border border-white/10 bg-card/85 p-4 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
                  {activeSection.title}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {activeImage.imageIndex + 1} / {activeSection.images.length}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close viewer"
                onClick={() => setActiveImage(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-black/40">
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                width={1800}
                height={2200}
                className="mx-auto max-h-[78vh] h-auto w-auto object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => moveActiveImage(-1)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                Prev
              </button>

              <p className="text-center text-sm text-muted">
                Use arrow keys to browse and `Esc` to close.
              </p>

              <button
                type="button"
                aria-label="Next image"
                onClick={() => moveActiveImage(1)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
