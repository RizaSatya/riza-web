import type { Metadata } from "next";
import { Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description:
    "Senior Software Engineer specializing in DevOps and backend systems.",
};

const experience = [
  {
    period: "March 2022 – 2024",
    title: "Senior Software Engineer (Backend, DevOps)",
    company: "GoTo",
    bullets: [
      "Maintain test coverage to at least 90%, enhancing product reliability and stability.",
      "PIC for Cloud modernization project in internal developer portal side — GCP project onboarding, application base infrastructure onboarding through developer portal.",
      "PIC for datastore provisioning through internal developer portal. Automate Patroni cluster & Redis resource creation in GCP.",
      "Google Groups for IAM role binding.",
    ],
    stack: "Ruby on Rails, GitOps, Gitlab CI/CD, Chef, Terraform/Terragrunt, Atlantis, GCP",
  },
  {
    period: "March 2020 – March 2022",
    title: "Mid Software Engineer (Backend)",
    company: "GoTo",
    bullets: [
      "PIC for improving the team's critical backend services monitoring (serving ~20,000 req/sec). Instrumented using Prometheus + Grafana Agent for metrics scraping and Grafana for dashboard creation and alerting to comply with SLO/SLA.",
      "Setup infrastructure components from scratch for a new service — Application VMs, HAProxy Load Balancer, Redis, Kafka Producer + Consumer, and monitoring with New Relic & Prometheus + Grafana.",
      "Created ADR (Architecture Decision Record) docs containing proposed system designs, technical analysis, and deployment/rollout strategies.",
      "PIC for migrating & rolling out legacy in-house config management service (used by all microservices) to a new service with 0 downtime. Includes RFC documents for DB schema, migration approaches, and task breakdown.",
    ],
    stack: "Golang, Kafka, Redis, Prometheus, Grafana",
  },
  {
    period: "March 2020",
    title: "DevOps Internal Bootcamp",
    company: "GoTo",
    bullets: [
      "Completed a 2-week internal DevOps bootcamp.",
      "Created end-to-end CI/CD pipeline from scratch using GitLab pipelines (test, build, deploy) for VM-based deployments using Vagrant, Ansible, HAProxy, and PostgreSQL.",
      "Created end-to-end CI/CD pipeline for containerized deployments in a local Kubernetes cluster (Minikube) — Docker for image artifact, Helm chart for Kubernetes manifests (deployment, job, configMap, secret, service).",
    ],
    stack: "Gitlab Pipeline, Vagrant, Ansible, Docker, Kubernetes, Helm",
  },
  {
    period: "Aug 2019 – March 2020",
    title: "Junior Software Engineer (Frontend, Backend)",
    company: "GoTo",
    bullets: [
      "Led the front-end development of the company's profile page.",
      "Conducted research and proof of concept for the latest frontend frameworks, selecting GatsbyJS for its performance & SEO benefits. Successfully advocated for adoption among stakeholders.",
      "Contributed to different backend microservices using Ruby on Rails.",
      "Collaborated with Product Managers on effort estimation, task breakdown, and project planning for PRDs.",
    ],
    stack: "Javascript, CSS, React, Redux",
  },
  {
    period: "Aug 2018 – Aug 2019",
    title: "Software Engineer Intern (Frontend, Backend)",
    company: "GoTo",
    bullets: [
      "Led the front-end development of an internal portal for a new project with supervision from a senior engineer.",
      "Collaborated with product managers, designers, backend engineers, and QA teams to ensure successful delivery and integration.",
      "Contributed to Backend for Frontend (BFF) service using Ruby on Rails.",
    ],
    stack: "Javascript, CSS, React, Redux",
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

      {/* Certifications */}
      <div
        className="animate-in mt-16"
        style={{ "--stagger": 4 } as React.CSSProperties}
      >
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Certifications
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="https://www.credly.com/badges/2d0b0f87-466b-416a-9228-092d35e8d29c"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl bg-card/50 px-5 py-4 transition-all duration-300 hover:bg-card hover:shadow-[0_0_20px_-4px_var(--glow)]"
          >
            <Image
              src="/images/cka.png"
              alt="CKA Badge"
              width={56}
              height={56}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <div>
              <p className="text-sm font-medium">Certified Kubernetes Administrator</p>
              <p className="mt-0.5 font-mono text-xs text-muted">CKA · CNCF</p>
            </div>
          </a>

          <a
            href="https://www.credly.com/badges/6ecdfc03-32e9-46df-ac87-b7f28aafacde"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl bg-card/50 px-5 py-4 transition-all duration-300 hover:bg-card hover:shadow-[0_0_20px_-4px_var(--glow)]"
          >
            <Image
              src="/images/tf.png"
              alt="Terraform Associate Badge"
              width={56}
              height={56}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <div>
              <p className="text-sm font-medium">HashiCorp Certified: Terraform Associate</p>
              <p className="mt-0.5 font-mono text-xs text-muted">HCTA0-003 · HashiCorp</p>
            </div>
          </a>
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
                <div className="h-2 w-2 shrink-0 rounded-full bg-accent/40 transition-colors group-hover:bg-accent group-hover:shadow-[0_0_8px_var(--accent)]" />
                {i < experience.length - 1 && (
                  <div className="mt-1 h-full w-px bg-border" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted">{item.period}</p>
                <h3 className="mt-0.5 font-medium">{item.title}</h3>
                <p className="font-mono text-xs text-accent/70">{item.company}</p>
                <ul className="mt-2 space-y-1">
                  {item.bullets.map((b, j) => (
                    <li key={j} className="text-sm text-muted leading-relaxed">
                      <span className="mr-2 text-accent/50">–</span>{b}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-mono text-xs text-muted/60">{item.stack}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      

      {/* Contact */}
      <div
        className="animate-in mt-16"
        style={{ "--stagger": 5 } as React.CSSProperties}
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
