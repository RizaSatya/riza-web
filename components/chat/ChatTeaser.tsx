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
                  I&apos;ve been HEE running production Kubernetes clusters on AWS and GCP for several years — multi-tenant EKS setups, custom controllers in Go, and GitOps via ArgoCD. I&apos;ve also written a deep-dive on Kubernetes networking if you want the details.
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
