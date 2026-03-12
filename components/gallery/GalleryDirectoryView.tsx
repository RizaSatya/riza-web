import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedGalleryTrip, type GalleryTrip } from "@/lib/gallery";

type GalleryDirectoryViewProps = {
  trips: GalleryTrip[];
};

export function GalleryDirectoryView({ trips }: GalleryDirectoryViewProps) {
  const featuredTrip = getFeaturedGalleryTrip(trips);
  const otherTrips = trips.filter((trip) => trip.slug !== featuredTrip?.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="animate-in" style={{ "--stagger": 0 } as CSSProperties}>
        <p className="font-mono text-sm text-accent">gallery</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Travel Photography
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          A quieter way to wander through selected journeys before stepping into each trip.
        </p>
      </div>

      {featuredTrip === null ? (
        <div className="mt-12 rounded-3xl border border-border bg-card/40 p-8 sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            No journeys yet
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            Travel frames will appear here once images are added to `public/images/gallery`.
          </p>
        </div>
      ) : (
        <div className="mt-14 space-y-16 sm:space-y-20">
          <section className="animate-in" style={{ "--stagger": 1 } as CSSProperties}>
            <div className="flex items-center gap-4">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
                Featured journey
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card/40">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                <Link
                  href={`/gallery/${featuredTrip.slug}`}
                  className="group relative block min-h-[20rem] overflow-hidden bg-card/60"
                >
                  <Image
                    src={featuredTrip.coverImage.src}
                    alt={featuredTrip.coverImage.alt}
                    width={1600}
                    height={1100}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </Link>

                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                    Selected trip
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    {featuredTrip.title}
                  </h2>
                  <p className="mt-4 text-sm text-muted sm:text-base">
                    {featuredTrip.imageCount}{" "}
                    {featuredTrip.imageCount === 1 ? "photo" : "photos"}
                  </p>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                    Start with the featured trip, then dip into the rest of the archive at your
                    own pace.
                  </p>
                  <div className="mt-8">
                    <Link
                      href={`/gallery/${featuredTrip.slug}`}
                      className="inline-flex rounded-full border border-accent/40 px-5 py-2.5 text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10"
                    >
                      View featured gallery
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {otherTrips.length > 0 ? (
            <section
              aria-label="All journeys"
              className="animate-in"
              style={{ "--stagger": 2 } as CSSProperties}
            >
              <div className="flex items-center gap-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
                  All journeys
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {otherTrips.map((trip) => (
                  <Link
                    key={trip.slug}
                    href={`/gallery/${trip.slug}`}
                    className="group overflow-hidden rounded-[1.75rem] border border-border bg-card/40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-8px_var(--glow)]"
                  >
                    <div className="overflow-hidden bg-card/60">
                      <Image
                        src={trip.coverImage.src}
                        alt={trip.coverImage.alt}
                        width={1200}
                        height={900}
                        className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-2xl font-semibold tracking-tight">
                        {trip.title}
                      </h3>
                      <p className="mt-3 text-sm text-muted">
                        {trip.imageCount} {trip.imageCount === 1 ? "photo" : "photos"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
