import { defaultContent } from "@shsuman/api/content/defaults";
import type { SiteContent } from "@shsuman/api/content/schema";

import { orpc } from "./orpc";

/**
 * Server-side content loaders for public pages. Falls back to defaults (or an
 * empty list) when the API is unreachable, so pages always render.
 */
async function safe<T>(load: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.warn(`[content] ${label} unavailable, using fallback:`, (error as Error).message);
    return fallback;
  }
}

export const getContent = () => safe<SiteContent>(() => orpc.content.get(), defaultContent, "site content");
export const getPosts = () => safe(() => orpc.blog.list(), [], "blog posts");
export const getResources = () => safe(() => orpc.resources.list(), [], "resources");

export async function getPost(slug: string) {
  try {
    return await orpc.blog.get({ slug });
  } catch {
    return null;
  }
}

export async function getResource(slug: string) {
  try {
    return await orpc.resources.get({ slug });
  } catch {
    return null;
  }
}

export type Post = Awaited<ReturnType<typeof orpc.blog.list>>[number];
export type ResourceItem = Awaited<ReturnType<typeof orpc.resources.list>>[number];

/** Cache public HTML briefly at the edge; content edits show within a minute. */
export function setPublicCache(headers: Headers) {
  headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=600");
}
