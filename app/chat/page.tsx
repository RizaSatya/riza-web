import type { Metadata } from "next";
import { ChatInterface } from "@/components/chat/ChatInterface";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Ask an AI anything about Riza — his experience, skills, background, and blog posts. Powered by Google Gemini.",
};

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-20">
      <div className="animate-in" style={{ "--stagger": 0 } as React.CSSProperties}>
        <p className="font-mono text-sm text-accent">chat</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Ask me anything
        </h1>
        <p className="mt-3 text-muted">
          An AI trained on my CV and writing. Ask about my experience, skills, or blog posts.
        </p>
      </div>

      <div className="animate-in mt-10" style={{ "--stagger": 1 } as React.CSSProperties}>
        <ChatInterface />
      </div>
    </div>
  );
}
