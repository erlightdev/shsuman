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
const url = z.string().trim().max(2048).refine((value) => /^(https?:\/\/|\/)/.test(value), {
  message: "Must be an absolute http(s) URL or a site path starting with /",
});
const href = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => /^(https?:\/\/|mailto:|tel:|\/|#)/.test(value), {
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
  flipPrefix: line(60),
  flipWords: list(line(30), 6),
  lead: para(400),
  stats: list(z.strictObject({ value: line(12), label: line(40) }), 4),
});

export const aboutSection = z.strictObject({
  title: line(120),
  summary: para(900),
  passion: para(400),
  facts: list(z.strictObject({ term: line(30), detail: line(120) }), 6),
  interests: list(line(40), 16),
});

export const servicesSection = z.strictObject({
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

export const workSection = z.strictObject({
  title: line(120),
  items: list(z.strictObject({ title: line(100), description: para(500), tags: z.array(line(30)).max(6) }), 9),
});

export const experienceSection = z.strictObject({
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
  title: line(120),
  education: list(z.strictObject({ degree: line(120), school: line(120), location: line(80), year: line(10) }), 8),
  community: list(z.strictObject({ role: line(80), org: line(120), detail: line(160), logoUrl: url }), 12),
  skills: list(line(80), 12),
});

export const blogSection = z.strictObject({
  title: line(120),
  lead: para(300),
});

export const contactSection = z.strictObject({
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
  coverImage: url.nullable().optional(),
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
  url: href.nullable().optional(),
  category: line(64),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
});

export const resourcePatch = resourceInput.partial();

export type ResourceInput = z.infer<typeof resourceInput>;
