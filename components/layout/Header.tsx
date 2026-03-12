"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/chat", label: "Chat" },
  { href: "/blog", label: "Blog" },
  { href: "/tags", label: "Tags" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-0.5 font-mono text-lg tracking-tight"
        >
          <span className="text-foreground">riza</span>
          <span className="text-accent glow-pulse">.</span>
          <span className="text-foreground">dev</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm transition-all duration-300",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Bottom gradient fade */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-5xl px-6 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-lg px-4 py-2.5 text-sm transition-all duration-200",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-card/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
