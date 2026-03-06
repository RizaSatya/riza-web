"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { TOCItem } from "@/types/post";

export function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-24">
        <h4 className="mb-4 font-mono text-xs font-medium uppercase tracking-widest text-muted">
          Contents
        </h4>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

          <ul className="space-y-0.5 text-[13px]">
            {items.map((item) => (
              <li key={item.id} className="relative">
                {/* Active dot */}
                {activeId === item.id && (
                  <div className="absolute left-[-3px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                )}
                <a
                  href={`#${item.id}`}
                  className={clsx(
                    "block py-1.5 transition-colors duration-200",
                    item.level === 2 && "pl-4",
                    item.level === 3 && "pl-7",
                    item.level === 4 && "pl-10",
                    activeId === item.id
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
