/**
 * Idempotent seed: `npm run seed -w server`
 * - promotes the oldest account to admin if no admin exists yet
 * - imports starter blog posts from packages/api/src/content/seed/*.md
 * - adds the CV as the first resource
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createResource, getResource } from "@shsuman/api/content/resources";
import { createPost, getPost } from "@shsuman/api/content/service";
import { user } from "@shsuman/db/schema/index";
import { asc, eq, like } from "drizzle-orm";

import { db } from "../services";

const seedDir = fileURLToPath(new URL("../../../../packages/api/src/content/seed/", import.meta.url));

function parseFrontmatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match || match[1] === undefined || match[2] === undefined) throw new Error("Missing frontmatter");
  const data: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (!key || !rest.length) continue;
    const raw = rest.join(":").trim();
    data[key.trim()] = raw.startsWith("[") ? JSON.parse(raw) : raw.replace(/^"|"$/g, "");
  }
  return { data, body: match[2].trim() };
}

async function promoteFirstAdmin() {
  const [admin] = await db.select({ id: user.id }).from(user).where(like(user.role, "%admin%")).limit(1);
  if (admin) return console.log("✓ admin already exists");
  const [oldest] = await db.select({ id: user.id, email: user.email }).from(user).orderBy(asc(user.createdAt)).limit(1);
  if (!oldest) return console.log("• no accounts yet — the first sign-up becomes admin");
  await db.update(user).set({ role: "admin" }).where(eq(user.id, oldest.id));
  console.log(`✓ promoted ${oldest.email} to admin`);
}

async function seedPosts() {
  for (const file of (await readdir(seedDir)).filter((name) => name.endsWith(".md"))) {
    const slug = file.replace(/\.md$/, "");
    if (await getPost(db, slug, { includeDrafts: true })) {
      console.log(`• post exists: ${slug}`);
      continue;
    }
    const { data, body } = parseFrontmatter(await readFile(join(seedDir, file), "utf8"));
    await createPost(db, {
      slug,
      title: String(data.title),
      description: String(data.description),
      body,
      category: String(data.category),
      tags: (data.tags as string[]) ?? [],
      cover: (data.cover as "rings" | "wave" | "fan") ?? "rings",
      draft: data.draft === "true",
      publishedAt: new Date(String(data.pubDate)),
    });
    console.log(`✓ post: ${slug}`);
  }
}

async function seedResources() {
  if (await getResource(db, "curriculum-vitae", { includeDrafts: true })) return console.log("• resource exists: curriculum-vitae");
  await createResource(db, {
    slug: "curriculum-vitae",
    title: "Curriculum vitae",
    summary: "Full CV covering experience, education, community leadership and core skills.",
    body: "Download the latest CV as a PDF.",
    type: "link",
    url: "/suman-k-sharma-cv.pdf",
    category: "Profile",
    featured: true,
    draft: false,
  });
  console.log("✓ resource: curriculum-vitae");
}

await promoteFirstAdmin();
await seedPosts();
await seedResources();
process.exit(0);
