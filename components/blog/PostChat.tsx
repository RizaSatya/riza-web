"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, ChevronDown } from "lucide-react";

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
  "Summarize this post",
  "What are the key takeaways?",
  "What did Riza learn?",
];

export function PostChat({
  postTitle,
  postContent,
}: {
  postTitle: string;
  postContent: string;
}) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, postTitle, postContent }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-border bg-card/30">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-accent" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Ask about this post
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4">
          {/* Starter suggestions (only when no messages) */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3 pb-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="rounded-full border border-border bg-card/50 px-3 py-1 font-mono text-[11px] text-muted transition-colors hover:border-accent/30 hover:text-accent disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div ref={messagesEndRef} className="mt-3 space-y-4 overflow-y-auto" style={{ maxHeight: "600px" }}>
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" ? (
                    <div className="max-w-[90%] rounded-lg border border-accent/15 bg-accent/5 px-3 py-3">
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                        {renderMarkdown(m.content)}
                        {isLoading && m.content === "" && (
                          <span className="inline-block h-3 w-1.5 animate-pulse rounded-sm bg-accent align-middle" />
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-[90%] rounded-lg border border-border bg-card px-3 py-3">
                      <p className="text-xs leading-relaxed">{m.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="relative mt-3" ref={suggestionsRef}>
            {/* Suggestions dropdown (shown after first message) */}
            {messages.length > 0 && showSuggestions && (
              <div className="absolute bottom-full mb-1.5 left-0 right-0 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-10">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      sendMessage(q);
                      setShowSuggestions(false);
                    }}
                    disabled={isLoading}
                    className="w-full text-left px-3 py-2 font-mono text-[11px] text-muted hover:bg-accent/5 hover:text-accent transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 transition-colors focus-within:border-accent/30">
              {messages.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions((v) => !v)}
                    disabled={isLoading}
                    className="shrink-0 text-muted transition-colors hover:text-accent disabled:opacity-50"
                    aria-label="Suggestions"
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform ${showSuggestions ? "rotate-180" : ""}`} />
                  </button>
                  <span className="text-border select-none text-xs">|</span>
                </>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about this post..."
                disabled={isLoading}
                className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted transition-colors hover:text-accent disabled:opacity-30"
                aria-label="Send"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            {messages.length > 0 ? (
              <button
                onClick={() => setMessages([])}
                className="font-mono text-[10px] text-muted transition-colors hover:text-foreground"
              >
                clear
              </button>
            ) : <span />}
            <p className="font-mono text-[10px] text-muted">powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      )}
    </div>
  );
}
