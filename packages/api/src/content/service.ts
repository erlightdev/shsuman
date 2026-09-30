import { randomUUID } from "node:crypto";
import type { Database } from "@shsuman/db";
import { blogPost, siteContent } from "@shsuman/db/schema/index";
import { and, desc, eq, lte } from "drizzle-orm";

import { defaultContent } from "./defaults";
import {
  type BlogPostInput,
  blogPostInput,
  blogPostPatch,
  SECTION_KEYS,
  type SectionKey,
  type SiteContent,
  sectionSchemas,
} from "./schema";

/* ---------- Site content ---------- */

/** Every section, stored value when valid, default otherwise. */
export async function getSiteContent(db: Database): Promise<SiteContent> {
  const rows = await db.select().from(siteContent);
  const content = structuredClone(defaultContent);
  for (const row of rows) {
    const key = row.section as SectionKey;
    if (!SECTION_KEYS.includes(key)) continue;
    if (!row?.data || typeof row.data !== "object") continue;
    const merged = { ...defaultContent[key], ...(row.data as Record<string, unknown>) };
    const parsed = sectionSchemas[key].safeParse(merged);
    if (parsed.success) (content as Record<SectionKey, unknown>)[key] = parsed.data;
  }
  return content;
}

export async function getSection<K extends SectionKey>(db: Database, key: K): Promise<SiteContent[K]> {
  const [row] = await db.select().from(siteContent).where(eq(siteContent.section, key));
  if (!row?.data || typeof row.data !== "object") {
    return defaultContent[key];
  }
  const merged = { ...defaultContent[key], ...(row.data as Record<string, unknown>) };
  const parsed = sectionSchemas[key].safeParse(merged);
  return (parsed.success ? parsed.data : defaultContent[key]) as SiteContent[K];
}

/**
 * Update a section. `patch` may contain only some top-level fields; they are
 * merged over the current value and the whole section is validated before
 * saving. Unknown fields are rejected, so only content can change.
 */
export async function updateSection<K extends SectionKey>(
  db: Database,
  key: K,
  patch: Record<string, unknown>,
  actor: string,
): Promise<SiteContent[K]> {
  const current = await getSection(db, key);
  const next = sectionSchemas[key].parse({ ...current, ...patch }) as SiteContent[K];
  await db
    .insert(siteContent)
    .values({ section: key, data: next, updatedBy: actor })
    .onDuplicateKeyUpdate({ set: { data: next, updatedBy: actor } });
  return next;
}

/** Drop the stored value so the section falls back to its default. */
export async function resetSection(db: Database, key: SectionKey) {
  await db.delete(siteContent).where(eq(siteContent.section, key));
  return defaultContent[key];
}

export async function getContentMeta(db: Database) {
  const rows = await db
    .select({
      section: siteContent.section,
      data: siteContent.data,
      updatedAt: siteContent.updatedAt,
      updatedBy: siteContent.updatedBy,
    })
    .from(siteContent);
  return SECTION_KEYS.map((key) => {
    const row = rows.find((item) => item.section === key);
    let enabled = true;
    if (row?.data && typeof row.data === "object" && "enabled" in row.data) {
      enabled = (row.data as { enabled?: boolean }).enabled !== false;
    }
    return {
      section: key,
      customized: Boolean(row),
      enabled,
      updatedAt: row?.updatedAt ?? null,
      updatedBy: row?.updatedBy ?? null,
    };
  });
}

/* ---------- Blog ---------- */

export type BlogPost = typeof blogPost.$inferSelect;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160);
}

export async function listPosts(db: Database, options: { includeDrafts?: boolean } = {}) {
  const where = options.includeDrafts ? undefined : and(eq(blogPost.draft, false), lte(blogPost.publishedAt, new Date()));
  return db.select().from(blogPost).where(where).orderBy(desc(blogPost.publishedAt));
}

export async function getPost(db: Database, slug: string, options: { includeDrafts?: boolean } = {}) {
  const [post] = await db.select().from(blogPost).where(eq(blogPost.slug, slug));
  if (!post) return null;
  if (!options.includeDrafts && (post.draft || post.publishedAt > new Date())) return null;
  return post;
}

async function uniqueSlug(db: Database, base: string, ignoreId?: string) {
  let candidate = base;
  for (let i = 2; ; i++) {
    const [hit] = await db.select({ id: blogPost.id }).from(blogPost).where(eq(blogPost.slug, candidate));
    if (!hit || hit.id === ignoreId) return candidate;
    candidate = `${base}-${i}`;
  }
}

export async function createPost(db: Database, input: BlogPostInput) {
  const data = blogPostInput.parse(input);
  const id = randomUUID();
  const slug = await uniqueSlug(db, data.slug ?? slugify(data.title));
  await db.insert(blogPost).values({
    id,
    slug,
    title: data.title,
    description: data.description,
    body: data.body,
    category: data.category,
    tags: data.tags,
    cover: data.cover,
    coverImage: data.coverImage ?? null,
    draft: data.draft,
    publishedAt: data.publishedAt ?? new Date(),
  });
  return (await getPost(db, slug, { includeDrafts: true })) as BlogPost;
}

export async function updatePost(db: Database, currentSlug: string, patch: Partial<BlogPostInput>) {
  const existing = await getPost(db, currentSlug, { includeDrafts: true });
  if (!existing) return null;
  const data = blogPostPatch.parse(patch);
  const slug = data.slug && data.slug !== existing.slug ? await uniqueSlug(db, data.slug, existing.id) : existing.slug;
  await db
    .update(blogPost)
    .set({
      ...data,
      slug,
      coverImage: data.coverImage === undefined ? existing.coverImage : data.coverImage,
    })
    .where(eq(blogPost.id, existing.id));
  return getPost(db, slug, { includeDrafts: true });
}

export async function deletePost(db: Database, slug: string) {
  const existing = await getPost(db, slug, { includeDrafts: true });
  if (!existing) return false;
  await db.delete(blogPost).where(eq(blogPost.id, existing.id));
  return true;
}
