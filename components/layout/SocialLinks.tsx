import { Github, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site";

interface SocialLinksProps {
  iconClassName: string;
  linkClassName: string;
}

const socialLinks = [
  {
    href: siteConfig.githubUrl,
    label: "GitHub",
    icon: Github,
  },
  {
    href: `mailto:${siteConfig.email}`,
    label: "Email",
    icon: Mail,
  },
];

export function SocialLinks({
  iconClassName,
  linkClassName,
}: SocialLinksProps) {
  return (
    <>
      {socialLinks.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          className={linkClassName}
          aria-label={label}
        >
          <Icon className={iconClassName} />
          <span className="sr-only">{label}</span>
        </a>
      ))}
    </>
  );
}
