import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@shsuman/db";
import * as schema from "@shsuman/db/schema/auth";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin } from "better-auth/plugins";
import { count } from "drizzle-orm";

import { ac, roles } from "./permissions";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
};

export function createAuth(
  env: AuthConfig,
  database: Database,
  desktopOrigins: readonly string[] = [],
) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "mysql",
      schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN, ...desktopOrigins],
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      // Cross-site cookies need SameSite=None + Secure (https). On http://localhost
      // the web app and API are same-site, and browsers such as Safari drop Secure
      // cookies over http, so fall back to Lax there.
      defaultCookieAttributes: env.BETTER_AUTH_URL.startsWith("https://")
        ? { sameSite: "none", secure: true, httpOnly: true }
        : { sameSite: "lax", secure: false, httpOnly: true },
    },
    databaseHooks: {
      user: {
        create: {
          // The very first account becomes the site admin; everyone after starts as "user".
          before: async (data) => {
            const [row] = await database.select({ total: count() }).from(schema.user);
            return { data: { ...data, role: (row?.total ?? 0) === 0 ? "admin" : "user" } };
          },
        },
      },
    },
    hooks: {
      // Public registration is closed. Sign-up only works to bootstrap the very first
      // (admin) account on an empty database; later users are created by an admin.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") return;
        const [row] = await database.select({ total: count() }).from(schema.user);
        if ((row?.total ?? 0) > 0) {
          throw new APIError("FORBIDDEN", { message: "Registration is closed." });
        }
      }),
    },
    plugins: [admin({ ac, roles, defaultRole: "user", adminRoles: ["admin"] })],
  });
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
