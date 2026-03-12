import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GalleryView } from "@/components/gallery/GalleryView";
import type { GalleryTrip } from "@/lib/gallery";

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

describe("GalleryView", () => {
  it("renders the trip header, back link, and images", () => {
    render(<GalleryView trip={trip} />);

    expect(screen.getByRole("heading", { name: "Rome Italy Winter 2024" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to gallery/i })).toHaveAttribute(
      "href",
      "/gallery"
    );
    expect(screen.getByText("3 photos")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(3);
    expect(screen.getByAltText("Rome Italy Winter 2024 photo 1")).toBeInTheDocument();
  });

  it("renders a masonry-style image wall with clickable image triggers", () => {
    const { container } = render(<GalleryView trip={trip} />);

    expect(container.querySelector(".columns-1")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: /open rome italy winter 2024 photo 1/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /open rome italy winter 2024 photo 2/i })
    ).toBeInTheDocument();
  });

  it("opens a popup viewer, supports next and previous navigation, and closes cleanly", () => {
    render(<GalleryView trip={trip} />);

    fireEvent.click(
      screen.getByRole("button", { name: /open rome italy winter 2024 photo 2/i })
    );

    const dialog = screen.getByRole("dialog", { name: /image viewer/i });
    expect(within(dialog).getByAltText("Rome Italy Winter 2024 photo 2")).toBeInTheDocument();
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /next image/i }));
    expect(within(dialog).getByAltText("Rome Italy Winter 2024 photo 3")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /previous image/i }));
    expect(within(dialog).getByAltText("Rome Italy Winter 2024 photo 2")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /close viewer/i }));
    expect(screen.queryByRole("dialog", { name: /image viewer/i })).not.toBeInTheDocument();
  });

  it("supports keyboard controls in the popup viewer", () => {
    render(<GalleryView trip={trip} />);

    fireEvent.click(
      screen.getByRole("button", { name: /open rome italy winter 2024 photo 1/i })
    );

    let dialog = screen.getByRole("dialog", { name: /image viewer/i });

    fireEvent.keyDown(window, { key: "ArrowRight" });
    dialog = screen.getByRole("dialog", { name: /image viewer/i });
    expect(within(dialog).getByAltText("Rome Italy Winter 2024 photo 2")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    dialog = screen.getByRole("dialog", { name: /image viewer/i });
    expect(within(dialog).getByAltText("Rome Italy Winter 2024 photo 1")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: /image viewer/i })).not.toBeInTheDocument();
  });
});
