"use client";

import { useState, useEffect, useRef } from "react";
import { Send, RotateCcw, ChevronDown } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string };

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

const STARTER_QUESTIONS = [
  "What's your experience with Kubernetes?",
  "What programming languages do you use?",
  "Tell me about your recent blog posts",
  "How can I contact you?",
];

const BLOG_POST_SUGGESTIONS = [
  { title: "Kubernetes Networking Deep Dive", question: "What did Riza learn from writing about Kubernetes networking?" },
  { title: "Terraform Best Practices", question: "What are the key takeaways from Riza's post on Terraform best practices?" },
  { title: "CI/CD Pipelines with GitHub Actions", question: "What did Riza cover in his post about building CI/CD pipelines with GitHub Actions?" },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);
    setError(false);

    try {
      const history = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch {
      setError(true);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 320px)", minHeight: "400px" }}>
      {/* Message area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card/30 p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                ask me anything
              </p>
              <p className="mt-2 text-sm text-muted">
                I can answer questions about Riza&apos;s experience, skills, and writing.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted transition-all duration-200 hover:border-accent/30 hover:bg-accent/5 hover:text-foreground disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" ? (
                  <div className="max-w-[85%]">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-accent">&#62;</span>
                      <span className="font-mono text-xs uppercase tracking-widest text-muted">
                        riza.ai
                      </span>
                    </div>
                    <div className="rounded-xl border border-accent/15 bg-accent/5 px-4 py-3">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                        {renderMarkdown(message.content)}
                        {isLoading && message.content === "" && (
                          <span className="inline-block h-4 w-2 animate-pulse rounded-sm bg-accent align-middle" />
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Error state */}
            {error && (
              <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
                <button
                  onClick={() => setError(false)}
                  className="ml-4 flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  dismiss
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative" ref={suggestionsRef}>
          {showSuggestions && (
            <div className="absolute bottom-full mb-2 left-0 right-0 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-10">
              <p className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted border-b border-border">
                ask about what Riza learned on his blog posts
              </p>
              {BLOG_POST_SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    sendMessage(s.question);
                    setShowSuggestions(false);
                  }}
                  disabled={isLoading}
                  className="w-full text-left px-4 py-3 text-sm text-foreground/80 hover:bg-accent/5 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <span className="text-accent font-mono text-xs mr-2">&#62;</span>
                  {s.title}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 transition-colors focus-within:border-accent/30">
            <button
              type="button"
              onClick={() => setShowSuggestions((v) => !v)}
              disabled={isLoading}
              className="flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-accent disabled:opacity-50 shrink-0"
              aria-label="Blog post suggestions"
            >
              blog posts
              <ChevronDown className={`h-3 w-3 transition-transform ${showSuggestions ? "rotate-180" : ""}`} />
            </button>
            <span className="text-border select-none">|</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-all duration-200 hover:bg-accent/10 hover:text-accent disabled:opacity-30"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {messages.length > 0 && (
          <div className="mt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setMessages([])}
              className="font-mono text-xs text-muted transition-colors hover:text-foreground"
            >
              clear conversation
            </button>
            <p className="font-mono text-xs text-muted">
              powered by Gemini 2.5 Flash
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
