import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GalleryView } from "@/components/gallery/GalleryView";
import type { GallerySection } from "@/lib/gallery";

describe("GalleryView", () => {
  it("renders an empty state when there are no sections", () => {
    render(<GalleryView sections={[]} />);

    expect(screen.getByRole("heading", { name: /travel photography/i })).toBeInTheDocument();
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

  it("renders a masonry-style image wall with clickable image triggers", () => {
    const sections: GallerySection[] = [
      {
        slug: "italy",
        title: "Italy",
        images: [
          { src: "/images/gallery/italy/01.jpg", alt: "Italy photo 1" },
          { src: "/images/gallery/italy/02.jpg", alt: "Italy photo 2" },
        ],
      },
    ];

    const { container } = render(<GalleryView sections={sections} />);

    expect(container.querySelector(".columns-1")).not.toBeNull();
    expect(screen.getByRole("button", { name: /open italy photo 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open italy photo 2/i })).toBeInTheDocument();
  });

  it("opens a popup viewer, supports next and previous navigation, and closes cleanly", () => {
    const sections: GallerySection[] = [
      {
        slug: "italy",
        title: "Italy",
        images: [
          { src: "/images/gallery/italy/01.jpg", alt: "Italy photo 1" },
          { src: "/images/gallery/italy/02.jpg", alt: "Italy photo 2" },
          { src: "/images/gallery/italy/03.jpg", alt: "Italy photo 3" },
        ],
      },
    ];

    render(<GalleryView sections={sections} />);

    fireEvent.click(screen.getByRole("button", { name: /open italy photo 2/i }));

    const dialog = screen.getByRole("dialog", { name: /image viewer/i });
    expect(within(dialog).getByAltText("Italy photo 2")).toBeInTheDocument();
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /next image/i }));
    expect(within(dialog).getByAltText("Italy photo 3")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /previous image/i }));
    expect(within(dialog).getByAltText("Italy photo 2")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /close viewer/i }));
    expect(screen.queryByRole("dialog", { name: /image viewer/i })).not.toBeInTheDocument();
  });

  it("supports keyboard controls in the popup viewer", () => {
    const sections: GallerySection[] = [
      {
        slug: "italy",
        title: "Italy",
        images: [
          { src: "/images/gallery/italy/01.jpg", alt: "Italy photo 1" },
          { src: "/images/gallery/italy/02.jpg", alt: "Italy photo 2" },
        ],
      },
    ];

    render(<GalleryView sections={sections} />);

    fireEvent.click(screen.getByRole("button", { name: /open italy photo 1/i }));

    let dialog = screen.getByRole("dialog", { name: /image viewer/i });

    fireEvent.keyDown(window, { key: "ArrowRight" });
    dialog = screen.getByRole("dialog", { name: /image viewer/i });
    expect(within(dialog).getByAltText("Italy photo 2")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    dialog = screen.getByRole("dialog", { name: /image viewer/i });
    expect(within(dialog).getByAltText("Italy photo 1")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: /image viewer/i })).not.toBeInTheDocument();
  });
});
