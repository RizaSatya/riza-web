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
    images: [
      {
        src: "/images/gallery/florence-italy-winter-2024/01.jpg",
        alt: "Florence Italy Winter 2024 photo 1",
      },
    ],
  },
];

describe("GalleryDirectoryView", () => {
  it("renders the featured trip separately from the directory cards", () => {
    render(<GalleryDirectoryView trips={trips} />);

    expect(screen.getByRole("heading", { name: /travel photography/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rome Italy Winter 2024" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view featured gallery/i })).toHaveAttribute(
      "href",
      "/gallery/rome-italy-winter-2024"
    );
    expect(screen.getByText("2 photos")).toBeInTheDocument();

    const directory = screen.getByRole("region", { name: /all journeys/i });
    expect(
      within(directory).getByRole("link", { name: /florence italy winter 2024/i })
    ).toHaveAttribute("href", "/gallery/florence-italy-winter-2024");
    expect(within(directory).getByText("1 photo")).toBeInTheDocument();
  });

  it("renders an empty state when there are no trips", () => {
    render(<GalleryDirectoryView trips={[]} />);

    expect(screen.getByRole("heading", { name: /travel photography/i })).toBeInTheDocument();
    expect(
      screen.getByText(/travel frames will appear here once images are added/i)
    ).toBeInTheDocument();
  });
});
