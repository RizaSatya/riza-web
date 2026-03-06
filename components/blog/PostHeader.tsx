import { TagBadge } from "./TagBadge";
import type { Post } from "@/types/post";

export function PostHeader({ post }: { post: Post }) {
  return (
    <header className="animate-in mb-12">
      <div className="flex items-center gap-3 font-mono text-sm text-muted">
        <span>
          {new Date(post.frontMatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="text-border">&middot;</span>
        <span>{post.readingTime}</span>
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {post.frontMatter.title}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {post.frontMatter.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      {/* Mobile CTA for chat */}
      <div className="mt-6 lg:hidden">
        <a
          href="#post-chat"
          className="inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 font-mono text-xs text-accent transition-colors hover:bg-accent/10 hover:border-accent/40"
        >
          <span>💬 Ask about this post, powered by Gemini 2.5 Flash </span>
        </a>
      </div>

      {/* Accent underline */}
      <div className="mt-8 h-px bg-gradient-to-r from-accent/40 via-accent/10 to-transparent" />
    </header>
  );
}
