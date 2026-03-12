import { SocialLinks } from "@/components/layout/SocialLinks";

export function Footer() {
  return (
    <footer>
      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2 font-mono text-sm text-muted">
          <span className="text-accent">$</span>
          <span>echo &quot;{new Date().getFullYear()} Riza Satyabudhi&quot;</span>
        </div>

        <div className="flex items-center gap-3">
          <SocialLinks
            iconClassName="h-4 w-4"
            linkClassName="rounded-full p-2 text-muted transition-all duration-300 hover:text-accent hover:shadow-[0_0_16px_-2px_var(--glow)]"
          />
        </div>
      </div>
    </footer>
  );
}
