import Link from "next/link";

export function ChatTeaser() {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          AI chat
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        <Link
          href="/chat"
          className="font-mono text-xs text-muted transition-colors hover:text-accent"
        >
          Open chat &rarr;
        </Link>
      </div>

      {/* Preview card */}
      <div className="mt-6 rounded-xl border border-border bg-card/30 p-4 sm:p-6">
        <div className="space-y-6">
          {/* User bubble */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-sm leading-relaxed">
                Tell me about yourself
              </p>
            </div>
          </div>

          {/* Assistant bubble */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono text-xs text-accent">&#62;</span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  riza.ai
                </span>
              </div>
              <div className="rounded-xl border border-accent/15 bg-accent/5 px-4 py-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  I am a Senior Platform Engineer with a foundation in full-stack and backend development, specializing in cloud modernization and high-throughput systems. From scaling services to 20,000 req/sec to automating GCP infrastructure, I focus on building the internal tools and reliability frameworks that empower developers to ship with confidence. I thrive at the intersection of automation, zero-downtime migrations, and developer experience.
                </p>
              </div>
            </div>
          </div>

          {/* Terminal CTA */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Link
                href="/chat"
                className="font-mono text-sm text-muted transition-colors hover:text-accent"
              >
                <span className="text-accent">&#62;</span> Ask me anything about me{" "}
                <span className="animate-pulse">_</span>
              </Link>
              <p className="font-mono text-xs text-muted">powered by Gemini 2.5 Flash</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
