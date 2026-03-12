"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GalleryTrip } from "@/lib/gallery";

type GalleryViewProps = {
  trip: GalleryTrip;
};

export function GalleryView({ trip }: GalleryViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const activePhoto = activeImageIndex === null ? null : trip.images[activeImageIndex];

  useEffect(() => {
    if (activeImageIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveImageIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveImageIndex((current) =>
          current === null ? null : (current + 1) % trip.images.length
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveImageIndex((current) =>
          current === null ? null : (current - 1 + trip.images.length) % trip.images.length
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImageIndex, trip.images.length]);

  function moveActiveImage(direction: 1 | -1) {
    setActiveImageIndex((current) => {
      if (current === null) return null;

      return (current + direction + trip.images.length) % trip.images.length;
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="animate-in" style={{ "--stagger": 0 } as CSSProperties}>
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:text-accent"
        >
          Back to gallery
        </Link>
        <p className="mt-6 font-mono text-sm text-accent">gallery</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {trip.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {trip.imageCount} {trip.imageCount === 1 ? "photo" : "photos"}
        </p>
      </div>

      <div className="mt-14 animate-in columns-1 gap-4 sm:columns-2 xl:columns-3">
        {trip.images.map((image, imageIndex) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Open ${image.alt}`}
            onClick={() => setActiveImageIndex(imageIndex)}
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

      {activeImageIndex !== null && activePhoto !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 p-4 backdrop-blur-md sm:p-6"
          onClick={() => setActiveImageIndex(null)}
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
                  {trip.title}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {activeImageIndex + 1} / {trip.images.length}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close viewer"
                onClick={() => setActiveImageIndex(null)}
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
