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
type Ctx = { db: Database; actor: Actor };

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
        "Manage content for Suman K. Sharma's portfolio website: homepage text, links, images and icons, blog posts and resources. Layout and design cannot be changed. Call get_section_schema before update_section.",
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
