import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllTags, getPostsByTag } from "@/lib/tags";
import { PostCard } from "@/components/blog/PostCard";
import { absoluteUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Posts tagged "${tag}"`,
    description: `All posts tagged with ${tag}.`,
    alternates: {
      canonical: `/tags/${tag}`,
    },
    openGraph: {
      title: `Posts tagged "${tag}"`,
      description: `All posts tagged with ${tag}.`,
      url: absoluteUrl(`/tags/${tag}`),
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="animate-in" style={{ "--stagger": 0 } as React.CSSProperties}>
        <Link
          href="/tags"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3 w-3" />
          All tags
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-accent/50">#</span>{tag}
        </h1>
        <p className="mt-3 text-muted">
          {posts.length} post{posts.length !== 1 ? "s" : ""}
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
