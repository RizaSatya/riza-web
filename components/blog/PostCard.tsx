import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TagBadge } from "./TagBadge";
import type { Post } from "@/types/post";

export function PostCard({
  post,
  index = 0,
}: {
  post: Post;
  index?: number;
}) {
  return (
    <article
      className="animate-in group relative rounded-xl bg-card/50 p-4 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-8px_var(--glow)]"
      style={{ "--stagger": index } as React.CSSProperties}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-border transition-colors duration-300 group-hover:bg-accent" />

      <Link href={`/blog/${post.slug}`} className="block">
        <h2 className="flex items-start gap-2 font-display text-lg sm:text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
          {post.frontMatter.title}
          <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </h2>
      </Link>

      <div className="mt-2 flex items-center gap-3 font-mono text-xs text-muted">
        <span>
          {new Date(post.frontMatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-border">&middot;</span>
        <span>{post.readingTime}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {post.frontMatter.excerpt}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.frontMatter.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
    </article>
  );
}
