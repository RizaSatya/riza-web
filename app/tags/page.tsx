import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/tags";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse posts by tag.",
};

export default function TagsPage() {
  const tags = getAllTags();
  const maxCount = Math.max(...tags.map((t) => t.count));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="animate-in" style={{ "--stagger": 0 } as React.CSSProperties}>
        <p className="font-mono text-sm text-accent">tags</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Topics
        </h1>
        <p className="mt-3 text-muted">Browse posts by topic.</p>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map(({ tag, count }, i) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="animate-in group relative overflow-hidden rounded-xl bg-card/50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_-5px_var(--glow)]"
            style={{ "--stagger": i + 1 } as React.CSSProperties}
          >
            {/* Background fill bar showing relative popularity */}
            <div
              className="absolute inset-y-0 left-0 bg-accent/5 transition-all duration-300 group-hover:bg-accent/10"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />

            <div className="relative flex items-center justify-between">
              <span className="font-mono text-sm">
                <span className="text-accent/50">#</span>
                <span className="transition-colors group-hover:text-accent">
                  {tag}
                </span>
              </span>
              <span className="font-mono text-xs text-muted">
                {count} post{count !== 1 ? "s" : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
