import { ORPCError, type RouterClient } from "@orpc/server";
import { z } from "zod";

import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  updateResource,
} from "../content/resources";
import { blogPostInput, blogPostPatch, resourceInput, resourcePatch, sectionKey } from "../content/schema";
import {
  createPost,
  deletePost,
  getContentMeta,
  getPost,
  getSiteContent,
  listPosts,
  resetSection,
  updatePost,
  updateSection,
} from "../content/service";
import { createToken, listTokens, revokeToken } from "../content/tokens";
import { editorProcedure, publicProcedure } from "../index";
import { MCP_TOOLS } from "../mcp/tools";

const bySlug = z.object({ slug: z.string().min(1).max(160) });

const notFound = <T>(value: T | null | undefined): T => {
  if (!value) throw new ORPCError("NOT_FOUND");
  return value;
};

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),

  content: {
    get: publicProcedure.handler(({ context }) => getSiteContent(context.db)),
    meta: editorProcedure.handler(({ context }) => getContentMeta(context.db)),
    update: editorProcedure
      .input(z.object({ section: sectionKey, data: z.record(z.string(), z.unknown()) }))
      .handler(({ context, input }) =>
        updateSection(context.db, input.section, input.data, context.session.user.email),
      ),
    toggle: editorProcedure
      .input(z.object({ section: sectionKey, enabled: z.boolean() }))
      .handler(({ context, input }) =>
        updateSection(context.db, input.section, { enabled: input.enabled }, context.session.user.email),
      ),
    reset: editorProcedure
      .input(z.object({ section: sectionKey }))
      .handler(({ context, input }) => resetSection(context.db, input.section)),
  },

  blog: {
    list: publicProcedure.handler(({ context }) => listPosts(context.db)),
    get: publicProcedure.input(bySlug).handler(async ({ context, input }) => notFound(await getPost(context.db, input.slug))),
    adminList: editorProcedure.handler(({ context }) => listPosts(context.db, { includeDrafts: true })),
    adminGet: editorProcedure
      .input(bySlug)
      .handler(async ({ context, input }) => notFound(await getPost(context.db, input.slug, { includeDrafts: true }))),
    create: editorProcedure.input(blogPostInput).handler(({ context, input }) => createPost(context.db, input)),
    update: editorProcedure
      .input(z.object({ slug: z.string(), data: blogPostPatch }))
      .handler(async ({ context, input }) => notFound(await updatePost(context.db, input.slug, input.data))),
    delete: editorProcedure
      .input(bySlug)
      .handler(async ({ context, input }) => ({ deleted: await deletePost(context.db, input.slug) })),
  },

  resources: {
    list: publicProcedure.handler(({ context }) => listResources(context.db)),
    get: publicProcedure
      .input(bySlug)
      .handler(async ({ context, input }) => notFound(await getResource(context.db, input.slug))),
    adminList: editorProcedure.handler(({ context }) => listResources(context.db, { includeDrafts: true })),
    adminGet: editorProcedure
      .input(bySlug)
      .handler(async ({ context, input }) =>
        notFound(await getResource(context.db, input.slug, { includeDrafts: true })),
      ),
    create: editorProcedure.input(resourceInput).handler(({ context, input }) => createResource(context.db, input)),
    update: editorProcedure
      .input(z.object({ slug: z.string(), data: resourcePatch }))
      .handler(async ({ context, input }) => notFound(await updateResource(context.db, input.slug, input.data))),
    delete: editorProcedure
      .input(bySlug)
      .handler(async ({ context, input }) => ({ deleted: await deleteResource(context.db, input.slug) })),
  },

  mcp: {
    tools: editorProcedure.handler(() => MCP_TOOLS.map(({ name, title, description }) => ({ name, title, description }))),
    tokens: editorProcedure.handler(({ context }) => listTokens(context.db)),
    createToken: editorProcedure
      .input(z.object({ name: z.string().trim().min(1).max(100) }))
      .handler(({ context, input }) => createToken(context.db, context.session.user.id, input.name)),
    revokeToken: editorProcedure
      .input(z.object({ id: z.uuid() }))
      .handler(async ({ context, input }) => {
        await revokeToken(context.db, input.id);
        return { revoked: true };
      }),
  },
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
