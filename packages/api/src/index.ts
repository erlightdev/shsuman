import { ORPCError, os } from "@orpc/server";

import { hasRole, type Role } from "@shsuman/auth/permissions";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

const requireRole = (...allowed: Role[]) =>
  o.middleware(async ({ context, next }) => {
    const user = context.session?.user as { role?: string | null } | undefined;
    if (!user) throw new ORPCError("UNAUTHORIZED");
    if (!hasRole(user.role, ...allowed)) throw new ORPCError("FORBIDDEN");
    return next({ context: { session: context.session! } });
  });

/** Admins and editors: site content, blog, resources, MCP tokens. */
export const editorProcedure = publicProcedure.use(requireRole("admin", "editor"));

/** Admins only: user management. */
export const adminProcedure = publicProcedure.use(requireRole("admin"));
