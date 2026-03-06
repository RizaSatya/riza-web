import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const skills = [
  "Kubernetes",
  "Docker",
  "Terraform",
  "AWS",
  "GCP",
  "Go",
  "Python",
  "Node.js",
  "PostgreSQL",
  "Redis",
  "GitHub Actions",
  "ArgoCD",
];

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="relative py-24 sm:py-32">
        {/* Gradient orb behind text */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-[100px]" />

        <div className="animate-in relative" style={{ "--stagger": 0 } as React.CSSProperties}>
          <p className="font-mono text-sm text-accent">
            <span className="cursor-blink">_</span> hello world
          </p>
        </div>

        <h1
          className="animate-in relative mt-6 font-display text-5xl font-bold tracking-tight sm:text-7xl"
          style={{ "--stagger": 1 } as React.CSSProperties}
        >
          Riza Satyabudhi
        </h1>

        <p
          className="animate-in relative mt-4 bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-xl font-medium text-transparent sm:text-2xl"
          style={{ "--stagger": 2 } as React.CSSProperties}
        >
          Senior Software Engineer &middot; DevOps &amp; Backend
        </p>

        <p
          className="animate-in relative mt-6 max-w-xl text-base leading-relaxed text-muted"
          style={{ "--stagger": 3 } as React.CSSProperties}
        >
          I build and scale backend systems and cloud infrastructure. I write
          about the tools and patterns that make production systems reliable.
        </p>

        <div
          className="animate-in relative mt-8 flex items-center gap-3"
          style={{ "--stagger": 4 } as React.CSSProperties}
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2.5 text-muted transition-all duration-300 hover:text-accent hover:shadow-[0_0_20px_-4px_var(--glow)]"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2.5 text-muted transition-all duration-300 hover:text-accent hover:shadow-[0_0_20px_-4px_var(--glow)]"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="mailto:hello@riza.dev"
            className="rounded-full p-2.5 text-muted transition-all duration-300 hover:text-accent hover:shadow-[0_0_20px_-4px_var(--glow)]"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Skills */}
      <section className="py-12">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Stack
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-lg bg-card/50 px-3 py-1.5 font-mono text-xs text-muted transition-all duration-200 hover:border-accent/30 hover:text-accent"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-12 pb-24">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Recent writing
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          <Link
            href="/blog"
            className="font-mono text-xs text-muted transition-colors hover:text-accent"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-6 space-y-3">
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
