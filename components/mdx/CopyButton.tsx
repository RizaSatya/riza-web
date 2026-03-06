"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute right-3 top-2 z-10 flex items-center gap-1.5 rounded-md bg-background/60 px-2 py-1 font-mono text-xs opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-accent" />
          <span className="text-accent">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 text-muted" />
          <span className="text-muted">Copy</span>
        </>
      )}
    </button>
  );
}
