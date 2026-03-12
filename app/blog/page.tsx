import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on DevOps, backend engineering, and cloud infrastructure.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog",
    description:
      "Thoughts on DevOps, backend engineering, and cloud infrastructure.",
    url: absoluteUrl("/blog"),
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="animate-in" style={{ "--stagger": 0 } as React.CSSProperties}>
        <p className="font-mono text-sm text-accent">blog</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Writing{" "}
          <span className="text-muted">({posts.length})</span>
        </h1>
        <p className="mt-3 text-muted">
          On DevOps, backend systems, and cloud infrastructure.
        </p>
      </div>

      <div className="mt-12 space-y-3">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
