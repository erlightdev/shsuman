import { randomUUID } from "node:crypto";
import type { Database } from "@shsuman/db";
import { resource } from "@shsuman/db/schema/index";
import { and, asc, desc, eq, lte } from "drizzle-orm";

import { type ResourceInput, resourceInput, resourcePatch } from "./schema";
import { slugify } from "./service";

export type Resource = typeof resource.$inferSelect;

export async function listResources(db: Database, options: { includeDrafts?: boolean } = {}) {
  const where = options.includeDrafts ? undefined : and(eq(resource.draft, false), lte(resource.publishedAt, new Date()));
  return db.select().from(resource).where(where).orderBy(desc(resource.featured), asc(resource.category), desc(resource.publishedAt));
}

export async function getResource(db: Database, slug: string, options: { includeDrafts?: boolean } = {}) {
  const [row] = await db.select().from(resource).where(eq(resource.slug, slug));
  if (!row) return null;
  if (!options.includeDrafts && (row.draft || row.publishedAt > new Date())) return null;
  return row;
}

async function uniqueSlug(db: Database, base: string, ignoreId?: string) {
  let candidate = base;
  for (let i = 2; ; i++) {
    const [hit] = await db.select({ id: resource.id }).from(resource).where(eq(resource.slug, candidate));
    if (!hit || hit.id === ignoreId) return candidate;
    candidate = `${base}-${i}`;
  }
}

export async function createResource(db: Database, input: ResourceInput) {
  const data = resourceInput.parse(input);
  const slug = await uniqueSlug(db, data.slug ?? slugify(data.title));
  await db.insert(resource).values({
    id: randomUUID(),
    slug,
    title: data.title,
    summary: data.summary,
    body: data.body,
    type: data.type,
    url: data.url ?? null,
    category: data.category,
    featured: data.featured,
    draft: data.draft,
    publishedAt: data.publishedAt ?? new Date(),
  });
  return (await getResource(db, slug, { includeDrafts: true })) as Resource;
}

export async function updateResource(db: Database, currentSlug: string, patch: Partial<ResourceInput>) {
  const existing = await getResource(db, currentSlug, { includeDrafts: true });
  if (!existing) return null;
  const data = resourcePatch.parse(patch);
  const slug = data.slug && data.slug !== existing.slug ? await uniqueSlug(db, data.slug, existing.id) : existing.slug;
  await db
    .update(resource)
    .set({ ...data, slug, url: data.url === undefined ? existing.url : data.url })
    .where(eq(resource.id, existing.id));
  return getResource(db, slug, { includeDrafts: true });
}

export async function deleteResource(db: Database, slug: string) {
  const existing = await getResource(db, slug, { includeDrafts: true });
  if (!existing) return false;
  await db.delete(resource).where(eq(resource.id, existing.id));
  return true;
}
