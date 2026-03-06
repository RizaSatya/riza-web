import type { Metadata } from "next";
import { Github, Linkedin, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Senior Software Engineer specializing in DevOps and backend systems.",
};

const experience = [
  {
    title: "Backend Development",
    description: "Building APIs and microservices in Go, Python, and Node.js",
  },
  {
    title: "Cloud Infrastructure",
    description: "AWS, GCP — designing for reliability and cost efficiency",
  },
  {
    title: "DevOps & Platform Engineering",
    description: "Kubernetes, Docker, Terraform, CI/CD pipelines",
  },
  {
    title: "Observability",
    description:
      "Monitoring, logging, and tracing with Prometheus, Grafana, and OpenTelemetry",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="animate-in" style={{ "--stagger": 0 } as React.CSSProperties}>
        <p className="font-mono text-sm text-accent">about</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Riza Satyabudhi
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Senior Software Engineer focused on DevOps and backend systems. I
          build reliable, scalable infrastructure and developer tooling.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {/* What I Do */}
        <div
          className="animate-in rounded-xl bg-card/50 p-6"
          style={{ "--stagger": 1 } as React.CSSProperties}
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            What I Do
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            I specialize in designing and operating production systems at scale.
            Container orchestration with Kubernetes, infrastructure as code with
            Terraform, and building CI/CD pipelines that teams actually enjoy
            using.
          </p>
        </div>

        {/* This Blog */}
        <div
          className="animate-in rounded-xl bg-card/50 p-6"
          style={{ "--stagger": 2 } as React.CSSProperties}
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            This Blog
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            I write about the tools, patterns, and lessons I&apos;ve picked up
            while building and operating production systems. Posts cover
            Kubernetes, Terraform, CI/CD, and backend architecture.
          </p>
        </div>
      </div>

      {/* Experience */}
      <div
        className="animate-in mt-16"
        style={{ "--stagger": 3 } as React.CSSProperties}
      >
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Experience
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="mt-6 space-y-1">
          {experience.map((item, i) => (
            <div key={i} className="group flex gap-4 rounded-lg p-4 transition-colors hover:bg-card/50">
              {/* Timeline dot */}
              <div className="mt-2 flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-accent/40 transition-colors group-hover:bg-accent group-hover:shadow-[0_0_8px_var(--accent)]" />
                {i < experience.length - 1 && (
                  <div className="mt-1 h-full w-px bg-border" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div
        className="animate-in mt-16"
        style={{ "--stagger": 4 } as React.CSSProperties}
      >
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Get in touch
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-card/50 px-4 py-3 text-sm text-muted transition-all duration-300 hover:text-accent hover:shadow-[0_0_20px_-4px_var(--glow)]"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-card/50 px-4 py-3 text-sm text-muted transition-all duration-300 hover:text-accent hover:shadow-[0_0_20px_-4px_var(--glow)]"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>
          <a
            href="mailto:hello@riza.dev"
            className="flex items-center gap-2 rounded-lg bg-card/50 px-4 py-3 text-sm text-muted transition-all duration-300 hover:text-accent hover:shadow-[0_0_20px_-4px_var(--glow)]"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
