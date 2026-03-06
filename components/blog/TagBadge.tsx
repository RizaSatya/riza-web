import Link from "next/link";
import clsx from "clsx";

export function TagBadge({
  tag,
  count,
  size = "sm",
}: {
  tag: string;
  count?: number;
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={`/tags/${tag}`}
      className={clsx(
        "inline-flex items-center gap-1 rounded-md bg-accent/5 font-mono transition-colors hover:bg-accent/10 hover:text-accent",
        size === "sm"
          ? "px-2 py-0.5 text-xs text-muted"
          : "px-3 py-1 text-sm text-muted"
      )}
    >
      <span className="text-accent/50">#</span>
      {tag}
      {count !== undefined && (
        <span className="ml-1 text-muted/50">{count}</span>
      )}
    </Link>
  );
}
