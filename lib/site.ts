export const siteConfig = {
  name: "Riza Satyabudhi",
  shortName: "riza.dev",
  title: "Riza Satyabudhi — DevOps & Backend Engineer",
  description:
    "Senior Software Engineer specializing in DevOps, backend systems, cloud infrastructure, and developer tooling.",
  url: "https://riza.dev",
  email: "hello@riza.dev",
  location: "South Jakarta, Indonesia",
  jobTitle: "Senior Software Engineer",
  githubUrl: "https://github.com/RizaSatya",
  credlyUrls: [
    "https://www.credly.com/badges/2d0b0f87-466b-416a-9228-092d35e8d29c",
    "https://www.credly.com/badges/6ecdfc03-32e9-46df-ac87-b7f28aafacde",
  ],
  keywords: [
    "Riza Satyabudhi",
    "DevOps engineer",
    "Backend engineer",
    "Platform engineer",
    "Kubernetes",
    "Terraform",
    "GCP",
    "cloud infrastructure",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export const sameAsLinks = [siteConfig.githubUrl, ...siteConfig.credlyUrls];

export function getPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    mainEntityOfPage: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    jobTitle: siteConfig.jobTitle,
    homeLocation: {
      "@type": "Place",
      name: siteConfig.location,
    },
    sameAs: sameAsLinks,
    knowsAbout: [
      "DevOps",
      "Backend engineering",
      "Cloud infrastructure",
      "Kubernetes",
      "Terraform",
      "CI/CD",
      "Platform engineering",
    ],
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.shortName,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function getProfilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl("/about"),
    name: `${siteConfig.name} profile`,
    description: siteConfig.description,
    mainEntity: getPersonSchema(),
  };
}
