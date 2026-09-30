import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Database } from "@shsuman/db";
import { z } from "zod";

import { createResource, deleteResource, getResource, listResources, updateResource } from "../content/resources";
import {
  ACCENTS,
  blogPostInput,
  blogPostPatch,
  COVERS,
  ICONS,
  RESOURCE_TYPES,
  resourceInput,
  resourcePatch,
  SECTION_KEYS,
  SECTION_LABELS,
  sectionKey,
  sectionSchemas,
} from "../content/schema";
import {
  createPost,
  deletePost,
  getPost,
  getSection,
  getSiteContent,
  listPosts,
  resetSection,
  updatePost,
  updateSection,
} from "../content/service";

/**
 * Content-only MCP toolset. Every write goes through the same strict schemas
 * as the dashboard, so an MCP client can change text, links, images, icons,
 * blog posts and resources, but never layout, styling or users.
 */

type Actor = { email: string };
export type StoredFile = { url: string; filename: string; size: number; mimetype: string };
type Ctx = {
  db: Database;
  actor: Actor;
  /** Saves an uploaded file and returns its public URL; provided by the server. */
  storeFile?: (data: Buffer, originalName: string, mimetype: string) => Promise<StoredFile>;
};

type SectionName = (typeof SECTION_KEYS)[number];

/** Top-level array fields of a section, e.g. awards → certifications, awards, metrics. */
function listFields(section: SectionName) {
  const shape = sectionSchemas[section].shape as Record<string, z.ZodType>;
  return Object.entries(shape)
    .filter(([, field]) => {
      let inner: z.ZodType = field;
      while (inner instanceof z.ZodDefault || inner instanceof z.ZodOptional || inner instanceof z.ZodNullable) {
        inner = inner.unwrap() as z.ZodType;
      }
      return inner instanceof z.ZodArray;
    })
    .map(([key]) => key);
}

async function readList(db: Database, section: SectionName, field: string) {
  const fields = listFields(section);
  if (!fields.includes(field)) {
    throw new Error(`"${field}" is not a list in ${section}. Lists: ${fields.join(", ") || "none"}`);
  }
  const current = (await getSection(db, section)) as Record<string, unknown>;
  return [...((current[field] as unknown[] | undefined) ?? [])];
}

function checkIndex(list: unknown[], index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= list.length) {
    throw new Error(`index ${index} is out of range (list has ${list.length} items, 0-based)`);
  }
}

const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

/** Detects the real type from magic bytes, so a renamed file can't slip through. */
function sniffType(data: Buffer): string | null {
  const hex = data.subarray(0, 12).toString("hex");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e470d0a1a0a")) return "image/png";
  if (hex.startsWith("47494638")) return "image/gif";
  if (hex.startsWith("52494646") && data.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (hex.startsWith("25504446")) return "application/pdf";
  return null;
}

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:|\[?fe80:)/i;

async function loadMedia(args: Record<string, unknown>) {
  const maxBytes = 20 * 1024 * 1024;
  if (typeof args.sourceUrl === "string" && args.sourceUrl) {
    let source = new URL(args.sourceUrl);
    let response: Response | undefined;
    // Follow redirects by hand so every hop is checked against private hosts.
    for (let hop = 0; hop < 4; hop++) {
      if (source.protocol !== "https:") throw new Error("sourceUrl must use https://");
      if (PRIVATE_HOST.test(source.hostname)) throw new Error("sourceUrl must point to a public host");
      response = await fetch(source, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
      const location = response.headers.get("location");
      if (response.status < 300 || response.status >= 400 || !location) break;
      source = new URL(location, source);
      response = undefined;
    }
    if (!response) throw new Error("Too many redirects");
    if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > maxBytes) throw new Error("File is larger than 20 MB");
    const data = Buffer.from(await response.arrayBuffer());
    const name = String(args.filename || source.pathname.split("/").pop() || "file");
    return { data, name };
  }
  if (typeof args.base64 === "string" && args.base64) {
    const raw = args.base64.replace(/^data:[^;]+;base64,/, "");
    return { data: Buffer.from(raw, "base64"), name: String(args.filename || "file") };
  }
  throw new Error("Provide either sourceUrl or base64");
}

interface ToolDef {
  name: string;
  title: string;
  description: string;
  input: z.ZodRawShape;
  readOnly?: boolean;
  destructive?: boolean;
  run: (ctx: Ctx, args: Record<string, unknown>) => Promise<unknown>;
}

// JSON Schema can't express Date, so MCP clients send ISO date strings; the
// strict content schemas coerce them when the tool runs.
const isoDate = z.string().describe("ISO 8601 date, e.g. 2026-09-29 or 2026-09-29T09:00:00Z").optional();
const postInputForMcp = blogPostInput.extend({ publishedAt: isoDate });
const postPatchForMcp = blogPostPatch.extend({ publishedAt: isoDate });
const resourceInputForMcp = resourceInput.extend({ publishedAt: isoDate });
const resourcePatchForMcp = resourcePatch.extend({ publishedAt: isoDate });

const slugArg = { slug: z.string().min(1).max(160).describe("URL slug of the item") };

export const MCP_TOOLS: ToolDef[] = [
  {
    name: "list_sections",
    title: "List homepage sections",
    description: "List editable homepage sections with a short description of each.",
    input: {},
    readOnly: true,
    run: async () => SECTION_KEYS.map((key) => ({ section: key, ...SECTION_LABELS[key] })),
  },
  {
    name: "get_site_content",
    title: "Get site content",
    description: "Read the current content of one section, or of every section when `section` is omitted.",
    input: { section: sectionKey.optional() },
    readOnly: true,
    run: async ({ db }, args) =>
      args.section ? getSection(db, args.section as (typeof SECTION_KEYS)[number]) : getSiteContent(db),
  },
  {
    name: "get_section_schema",
    title: "Get section schema",
    description:
      "Return the JSON Schema for a section, including field names, required fields, length limits and allowed icons. Read this before calling update_section.",
    input: { section: sectionKey },
    readOnly: true,
    run: async (_ctx, args) => z.toJSONSchema(sectionSchemas[args.section as (typeof SECTION_KEYS)[number]]),
  },
  {
    name: "update_section",
    title: "Update section content",
    description:
      "Update a homepage section. Pass only the top-level fields you want to change in `data`; they replace the current values and the whole section is validated. Arrays (lists) are replaced as a whole, so send the full list. Unknown fields are rejected.",
    input: {
      section: sectionKey,
      data: z.record(z.string(), z.unknown()).describe("Top-level fields to change"),
    },
    run: async ({ db, actor }, args) =>
      updateSection(
        db,
        args.section as (typeof SECTION_KEYS)[number],
        args.data as Record<string, unknown>,
        `mcp:${actor.email}`,
      ),
  },
  {
    name: "toggle_section",
    title: "Toggle homepage section",
    description: "Enable or disable visibility of a section on the homepage (hero, about, services, work, experience, credentials, awards, blog, contact).",
    input: {
      section: sectionKey,
      enabled: z.boolean().describe("true to show the section on the homepage, false to hide it"),
    },
    run: async ({ db, actor }, args) =>
      updateSection(
        db,
        args.section as (typeof SECTION_KEYS)[number],
        { enabled: Boolean(args.enabled) },
        `mcp:${actor.email}`,
      ),
  },
  {
    name: "reset_section",
    title: "Reset section",
    description: "Discard saved changes to a section and restore its default content.",
    input: { section: sectionKey },
    destructive: true,
    run: async ({ db }, args) => resetSection(db, args.section as (typeof SECTION_KEYS)[number]),
  },
  {
    name: "list_icons",
    title: "List icons and covers",
    description: "List allowed icon names for services, accent colors for work cards, blog cover styles and resource types.",
    input: {},
    readOnly: true,
    run: async () => ({ icons: ICONS, accents: ACCENTS, blogCovers: COVERS, resourceTypes: RESOURCE_TYPES }),
  },

  /* Lists inside sections (certifications, honors, metrics, jobs, …) */
  {
    name: "add_section_item",
    title: "Add item to a section list",
    description:
      "Append one item to a list inside a section without resending the whole list, e.g. section 'awards' + field 'certifications' (name, issuer, year, credentialId?, badge?, imageUrl?, credentialUrl?), field 'awards' (title, issuer, year, description, imageUrl?, certificateUrl?) or field 'metrics' (label, value). Pass `index` to insert at a position (0 = first). Call get_section_schema for the item fields.",
    input: {
      section: sectionKey,
      field: z.string().min(1).describe("Name of the list field, e.g. certifications, awards, metrics, jobs"),
      item: z.unknown().describe("The new item (object or string, matching the list's item schema)"),
      index: z.number().int().min(0).optional().describe("Insert position, 0-based. Defaults to the end."),
    },
    run: async ({ db, actor }, args) => {
      const section = args.section as SectionName;
      const field = String(args.field);
      const list = await readList(db, section, field);
      const at = typeof args.index === "number" ? Math.min(args.index, list.length) : list.length;
      list.splice(at, 0, args.item);
      const next = (await updateSection(db, section, { [field]: list }, `mcp:${actor.email}`)) as Record<string, unknown>;
      return { index: at, [field]: next[field] };
    },
  },
  {
    name: "update_section_item",
    title: "Update item in a section list",
    description:
      "Change one item in a list inside a section. For object items only the fields in `data` change; for string items pass the new string as `data`. Use get_site_content to find the 0-based index.",
    input: {
      section: sectionKey,
      field: z.string().min(1).describe("Name of the list field, e.g. certifications, awards, metrics"),
      index: z.number().int().min(0).describe("0-based position of the item"),
      data: z.unknown().describe("Fields to change (object items) or the new value (string items)"),
    },
    run: async ({ db, actor }, args) => {
      const section = args.section as SectionName;
      const field = String(args.field);
      const index = Number(args.index);
      const list = await readList(db, section, field);
      checkIndex(list, index);
      const current = list[index];
      list[index] =
        current && typeof current === "object" && args.data && typeof args.data === "object"
          ? { ...(current as Record<string, unknown>), ...(args.data as Record<string, unknown>) }
          : args.data;
      const next = (await updateSection(db, section, { [field]: list }, `mcp:${actor.email}`)) as Record<string, unknown>;
      return (next[field] as unknown[])[index];
    },
  },
  {
    name: "remove_section_item",
    title: "Remove item from a section list",
    description: "Remove one item from a list inside a section by its 0-based index. Lists that require at least one item cannot be emptied.",
    input: {
      section: sectionKey,
      field: z.string().min(1).describe("Name of the list field, e.g. certifications, awards, metrics"),
      index: z.number().int().min(0).describe("0-based position of the item"),
    },
    destructive: true,
    run: async ({ db, actor }, args) => {
      const section = args.section as SectionName;
      const field = String(args.field);
      const index = Number(args.index);
      const list = await readList(db, section, field);
      checkIndex(list, index);
      const [removed] = list.splice(index, 1);
      await updateSection(db, section, { [field]: list }, `mcp:${actor.email}`);
      return { removed, remaining: list.length };
    },
  },

  /* Media */
  {
    name: "upload_media",
    title: "Upload image or PDF",
    description:
      "Upload an image (JPEG, PNG, WebP, GIF) or PDF, up to 20 MB, and get back a site path (/uploads/...) to use in imageUrl, coverImage, card1Image, portraitUrl, certificateUrl, cvUrl and similar fields. Give either `sourceUrl` (a public https link to copy) or `base64` file data with a `filename`.",
    input: {
      sourceUrl: z.url().optional().describe("Public https URL of the file to copy"),
      base64: z.string().optional().describe("File contents as base64 (a data: URL prefix is allowed)"),
      filename: z.string().max(120).optional().describe("File name, e.g. cisa-badge.png"),
    },
    run: async ({ storeFile }, args) => {
      if (!storeFile) throw new Error("Uploads are not available on this server");
      const { data, name } = await loadMedia(args);
      if (data.byteLength === 0) throw new Error("File is empty");
      const type = sniffType(data);
      if (!type) throw new Error("Only JPEG, PNG, WebP, GIF images and PDF files are allowed");
      const ext = MEDIA_TYPES[type];
      const base = name.replace(/\.[^.]*$/, "");
      return storeFile(data, `${base}${ext}`, type);
    },
  },

  /* Blog */
  {
    name: "list_blog_posts",
    title: "List blog posts",
    description: "List blog posts, newest first. Drafts are included when includeDrafts is true.",
    input: { includeDrafts: z.boolean().optional() },
    readOnly: true,
    run: async ({ db }, args) =>
      (await listPosts(db, { includeDrafts: Boolean(args.includeDrafts) })).map(({ body: _body, ...post }) => post),
  },
  {
    name: "get_blog_post",
    title: "Get blog post",
    description: "Read one blog post including its Markdown body.",
    input: slugArg,
    readOnly: true,
    run: async ({ db }, args) => getPost(db, String(args.slug), { includeDrafts: true }),
  },
  {
    name: "create_blog_post",
    title: "Create blog post",
    description:
      "Create a blog post. `body` is Markdown (headings, lists, links, bold, italic, blockquotes, code). Set draft to true to save without publishing.",
    input: postInputForMcp.shape,
    run: async ({ db }, args) => createPost(db, blogPostInput.parse(args)),
  },
  {
    name: "update_blog_post",
    title: "Update blog post",
    description: "Update fields of an existing blog post. Only the fields in `data` change.",
    input: { ...slugArg, data: postPatchForMcp },
    run: async ({ db }, args) => updatePost(db, String(args.slug), blogPostPatch.parse(args.data)),
  },
  {
    name: "delete_blog_post",
    title: "Delete blog post",
    description: "Permanently delete a blog post. Prefer update_blog_post with draft: true to hide it instead.",
    input: slugArg,
    destructive: true,
    run: async ({ db }, args) => ({ deleted: await deletePost(db, String(args.slug)) }),
  },

  /* Resources */
  {
    name: "list_resources",
    title: "List resources",
    description: "List resources shown on the /resources page.",
    input: { includeDrafts: z.boolean().optional() },
    readOnly: true,
    run: async ({ db }, args) =>
      (await listResources(db, { includeDrafts: Boolean(args.includeDrafts) })).map(({ body: _body, ...item }) => item),
  },
  {
    name: "get_resource",
    title: "Get resource",
    description: "Read one resource including its Markdown body.",
    input: slugArg,
    readOnly: true,
    run: async ({ db }, args) => getResource(db, String(args.slug), { includeDrafts: true }),
  },
  {
    name: "create_resource",
    title: "Create resource",
    description: "Create a resource (guide, template, checklist, talk, link or tool). `body` is Markdown; `url` links to a download or external page.",
    input: resourceInputForMcp.shape,
    run: async ({ db }, args) => createResource(db, resourceInput.parse(args)),
  },
  {
    name: "update_resource",
    title: "Update resource",
    description: "Update fields of an existing resource. Only the fields in `data` change.",
    input: { ...slugArg, data: resourcePatchForMcp },
    run: async ({ db }, args) => updateResource(db, String(args.slug), resourcePatch.parse(args.data)),
  },
  {
    name: "delete_resource",
    title: "Delete resource",
    description: "Permanently delete a resource. Prefer update_resource with draft: true to hide it instead.",
    input: slugArg,
    destructive: true,
    run: async ({ db }, args) => ({ deleted: await deleteResource(db, String(args.slug)) }),
  },
];

function toText(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value ?? null, null, 2) }] };
}

function toError(error: unknown) {
  const message =
    error instanceof z.ZodError
      ? `Validation failed:\n${z.prettifyError(error)}`
      : error instanceof Error
        ? error.message
        : "Unknown error";
  return { isError: true, content: [{ type: "text" as const, text: message }] };
}

export function createMcpServer(ctx: Ctx) {
  const server = new McpServer(
    { name: "shsuman-content", version: "1.0.0" },
    {
      instructions:
        "Manage content for Suman K. Sharma's portfolio website: homepage text, links, images and icons, blog posts and resources. Layout and design cannot be changed. Call get_section_schema before update_section. To add, edit or remove a single certification, honor, metric or other list entry use add_section_item / update_section_item / remove_section_item instead of resending the whole list. Use upload_media to get a URL for images and PDFs.",
    },
  );

  for (const tool of MCP_TOOLS) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.input,
        annotations: {
          title: tool.title,
          readOnlyHint: tool.readOnly ?? false,
          destructiveHint: tool.destructive ?? false,
          openWorldHint: false,
        },
      },
      async (args: Record<string, unknown>) => {
        try {
          return toText(await tool.run(ctx, args ?? {}));
        } catch (error) {
          return toError(error);
        }
      },
    );
  }

  return server;
}
