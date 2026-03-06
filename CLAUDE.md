# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (requires Node 22+, use `nvm use v22.1.0`)
- `npm run build` — production build
- `npm start` — serve production build

## Architecture

Next.js 16 App Router, TypeScript, Tailwind CSS v4, dark/light theme via `next-themes`.

**Content layer**: MDX blog posts in `content/posts/`. Parsed at build time by `lib/posts.ts` (gray-matter + reading-time). Rendered with `next-mdx-remote/rsc` + rehype-pretty-code (shiki) for syntax highlighting.

**Key directories**:
- `lib/` — `posts.ts`, `tags.ts`, `toc.ts` — data layer for reading MDX, aggregating tags, extracting ToC headings
- `components/mdx/` — custom MDX renderers (code blocks with copy button, images via next/image)
- `components/blog/` — PostCard, PostHeader, TableOfContents (client component with scroll-spy), TagBadge
- `components/layout/` — Header, Footer, ThemeProvider, ThemeToggle

**Routes**: `/` (home), `/blog`, `/blog/[slug]`, `/tags`, `/tags/[tag]`, `/about`, `/og` (dynamic OG image), `/sitemap.xml`, `/robots.txt`

**Styling**: "Terminal Luxe" aesthetic — Tailwind v4 with CSS custom properties. Colors in `app/globals.css` (`:root` light, `.dark` dark). Neutral zinc blacks + emerald-400 accent (`#34d399`). Three fonts: `Sora` (display/headings), `Inter` (body), `JetBrains Mono` (code/monospace UI). Typography plugin via `@plugin "@tailwindcss/typography"`. Dark mode variant via `@custom-variant dark`. Dot grid background, noise texture overlay, `fadeInUp` stagger animations via `.animate-in` class with `--stagger` CSS var, glow hover effects on cards/icons.

**SEO**: Every route exports `generateMetadata`. Blog posts include JSON-LD structured data, OG images generated at `/og` via `next/og` ImageResponse.

## Adding a blog post

Create `content/posts/my-post.mdx` with frontmatter:
```yaml
---
title: "Post Title"
date: "2025-01-01"
excerpt: "Short description"
tags: ["tag1", "tag2"]
draft: false
---
```
