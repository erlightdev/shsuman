import { z } from "zod";

/**
 * Editable site content. Schemas are strict: only text, links, image URLs and
 * icon names from a fixed set can change. Layout, styling and components are
 * never part of content, so edits (dashboard or MCP) cannot alter the UI.
 */

export const ICONS = [
  "shield",
  "briefcase",
  "landmark",
  "graduation-cap",
  "award",
  "network",
  "server",
  "lock",
  "users",
  "book",
  "globe",
  "target",
  "file-check",
  "cpu",
  "cloud",
] as const;

export const COVERS = ["rings", "wave", "fan"] as const;

const line = (max = 160) => z.string().trim().min(1).max(max);
const para = (max = 1200) => z.string().trim().min(1).max(max);

export const optionalLine = (max = 160) => z.string().trim().max(max).optional().nullable();

export const url = z.string().trim().max(2048).refine((value) => /^(https?:\/\/|\/)/.test(value), {
  message: "Must be an absolute http(s) URL or a site path starting with /",
});

export const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .nullable()
  .refine((value) => !value || value === "" || /^(https?:\/\/|\/)/.test(value), {
    message: "Must be an absolute http(s) URL or a site path starting with /",
  });

export const href = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => /^(https?:\/\/|mailto:|tel:|\/|#)/.test(value), {
    message: "Must start with http(s)://, mailto:, tel:, / or #",
  });

export const optionalHref = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .nullable()
  .refine((value) => !value || value === "" || /^(https?:\/\/|mailto:|tel:|\/|#)/.test(value), {
    message: "Must start with http(s)://, mailto:, tel:, / or #",
  });

const list = <T extends z.ZodType>(item: T, max: number) => z.array(item).min(1).max(max);

export const profileSection = z.strictObject({
  name: line(80),
  role: line(120),
  currentTitle: line(80),
  currentCompany: line(120),
  location: line(80),
  highlightRole: line(80),
  portraitUrl: url,
  portraitAlt: line(200),
  cvUrl: url,
});

export const heroSection = z.strictObject({
  enabled: z.boolean().default(true),
  flipPrefix: line(60),
  flipWords: list(line(30), 6),
  lead: para(400),
  stats: list(z.strictObject({ value: line(12), label: line(40) }), 4),
});

export const aboutSection = z.strictObject({
  enabled: z.boolean().default(true),
  title: line(120),
  summary: para(900),
  passion: para(400),
  facts: list(z.strictObject({ term: line(30), detail: line(120) }), 6),
  interests: list(line(40), 16),
});

export const servicesSection = z.strictObject({
  enabled: z.boolean().default(true),
  title: line(120),
  lead: para(300),
  items: list(
    z.strictObject({
      title: line(80),
      description: para(400),
      icon: z.enum(ICONS),
      points: z.array(line(40)).max(6),
    }),
    6,
  ),
  clientsTitle: line(120),
  clientsDescription: para(300),
  clients: list(z.strictObject({ name: line(80), sector: line(40) }), 20),
});

/** Card tints for the work section; each maps to a fixed color + pattern in the UI. */
export const ACCENTS = ["amber", "sky", "emerald", "violet", "rose"] as const;

export const workSection = z.strictObject({
  enabled: z.boolean().default(true),
  title: line(120),
  items: list(
    z.strictObject({
      title: line(100),
      description: para(500),
      tags: z.array(line(30)).max(6),
      accent: z.enum(ACCENTS).optional().nullable(),
    }),
    9,
  ),
});

export const experienceSection = z.strictObject({
  enabled: z.boolean().default(true),
  title: line(120),
  lead: para(300),
  jobs: list(
    z.strictObject({
      role: line(80),
      company: line(120),
      location: line(120),
      period: line(40),
      current: z.boolean(),
      points: list(para(400), 8),
    }),
    12,
  ),
});

export const credentialsSection = z.strictObject({
  enabled: z.boolean().default(true),
  title: line(120),
  education: list(z.strictObject({ degree: line(120), school: line(120), location: line(80), year: line(20) }), 8),
  community: list(z.strictObject({ role: line(80), org: line(120), detail: line(160), logoUrl: url }), 12),
  skills: list(line(80), 12),
});

export const awardsSection = z.strictObject({
  enabled: z.boolean().default(true),
  title: line(120),
  lead: para(300),

  // Card 1: Credentials / Certifications
  card1Title: line(120).default("Accredited credentials"),
  card1Description: para(400).default(
    "Formal industry accreditations spanning IS/IT systems audit, enterprise network security, and risk compliance.",
  ),
  card1Image: optionalUrl,
  certifications: list(
    z.strictObject({
      name: line(120),
      issuer: line(120),
      year: line(20),
      credentialId: optionalLine(120),
      badge: optionalLine(60),
      imageUrl: optionalUrl,
      credentialUrl: optionalHref,
    }),
    12,
  ),

  // Card 2: Honors & Leadership
  card2Title: line(120).default("Honors & leadership"),
  card2Description: para(400).default(
    "Recognized for national cybersecurity policy advocacy, executive training, and pioneering the open internet ecosystem.",
  ),
  card2Image: optionalUrl,
  awards: list(
    z.strictObject({
      title: line(120),
      issuer: line(120),
      year: line(20),
      description: para(400),
      imageUrl: optionalUrl,
      certificateUrl: optionalHref,
    }),
    12,
  ),

  // Card 3: Proven Governance & Track Record Metrics
  card3Title: line(120).default("Proven governance"),
  card3Description: para(400).default(
    "Over fifteen years of securing critical infrastructure, performing rigorous audits, and advising executive leadership.",
  ),
  card3Image: optionalUrl,
  metrics: list(
    z.strictObject({
      label: line(80),
      value: line(30),
    }),
    8,
  ).default([
    { label: "IS/IT audits completed", value: "100+" },
    { label: "Years of security practice", value: "15+" },
    { label: "System uptime & reliability", value: "99.9%" },
  ]),
});

export const blogSection = z.strictObject({
  enabled: z.boolean().default(true),
  title: line(120),
  lead: para(300),
});

export const contactSection = z.strictObject({
  enabled: z.boolean().default(true),
  title: line(120),
  lead: para(400),
  email: z.email().max(254),
  location: line(160),
  links: list(z.strictObject({ label: line(20), detail: line(120), href }), 6),
});

export const footerSection = z.strictObject({
  /** Markdown, edited with the rich-text editor */
  blurb: z.string().trim().max(1200),
  links: z.array(z.strictObject({ label: line(40), href })).max(8),
  note: line(200),
});

export const seoSection = z.strictObject({
  title: line(70),
  description: z.string().trim().min(50).max(170),
  ogImage: url,
  sameAs: z.array(href).max(8),
});

export const sectionSchemas = {
  profile: profileSection,
  hero: heroSection,
  about: aboutSection,
  services: servicesSection,
  work: workSection,
  experience: experienceSection,
  credentials: credentialsSection,
  awards: awardsSection,
  blog: blogSection,
  contact: contactSection,
  footer: footerSection,
  seo: seoSection,
} as const;

export type SectionKey = keyof typeof sectionSchemas;
export const SECTION_KEYS = Object.keys(sectionSchemas) as SectionKey[];
export const sectionKey = z.enum(SECTION_KEYS as [SectionKey, ...SectionKey[]]);

export type SiteContent = { [K in SectionKey]: z.infer<(typeof sectionSchemas)[K]> };

export const SECTION_LABELS: Record<SectionKey, { label: string; description: string }> = {
  profile: { label: "Profile", description: "Name, role, portrait and CV used across the site." },
  hero: { label: "Hero", description: "Rotating role words, intro paragraph and stats." },
  about: { label: "About", description: "Summary, quick facts and interests." },
  services: { label: "Services", description: "Service cards and the client list." },
  work: { label: "Key implementations", description: "Highlighted work items." },
  experience: { label: "Experience", description: "Career timeline." },
  credentials: { label: "Credentials", description: "Education, community roles and skills." },
  awards: { label: "Awards & Certifications", description: "Professional certifications and honors." },
  blog: { label: "Blog section", description: "Heading for the homepage blog preview." },
  contact: { label: "Contact", description: "Contact heading, email and links." },
  footer: { label: "Footer", description: "Footer text, links and copyright note." },
  seo: { label: "SEO", description: "Search title, description and social image." },
};

/* ---------- Blog ---------- */

export const slug = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

export const blogPostInput = z.strictObject({
  slug: slug.optional(),
  title: line(200),
  description: z.string().trim().min(20).max(320),
  body: z.string().trim().min(1).max(100_000),
  category: line(64),
  tags: z.array(line(40)).max(10).default([]),
  cover: z.enum(COVERS).default("rings"),
  coverImage: optionalUrl,
  draft: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
});

export const blogPostPatch = blogPostInput.partial();

export type BlogPostInput = z.infer<typeof blogPostInput>;

/* ---------- Resources ---------- */

export const RESOURCE_TYPES = ["guide", "template", "checklist", "talk", "link", "tool"] as const;

export const resourceInput = z.strictObject({
  slug: slug.optional(),
  title: line(200),
  summary: z.string().trim().min(10).max(320),
  body: z.string().trim().max(100_000).default(""),
  type: z.enum(RESOURCE_TYPES),
  url: optionalHref,
  category: line(64),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
});

export const resourcePatch = resourceInput.partial();

export type ResourceInput = z.infer<typeof resourceInput>;
