import { boolean, datetime, index, json, longtext, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { user } from "./auth";

/** One row per homepage section. `data` is validated by the section schema in @shsuman/api. */
export const siteContent = mysqlTable("site_content", {
  section: varchar("section", { length: 64 }).primaryKey(),
  data: json("data").notNull(),
  updatedBy: varchar("updated_by", { length: 255 }),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const blogPost = mysqlTable(
  "blog_post",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    description: varchar("description", { length: 320 }).notNull(),
    body: longtext("body").notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    tags: json("tags").$type<string[]>().notNull(),
    cover: varchar("cover", { length: 16 }).notNull().default("rings"),
    coverImage: text("cover_image"),
    draft: boolean("draft").default(false).notNull(),
    publishedAt: datetime("published_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("blog_post_published_idx").on(table.draft, table.publishedAt)],
);

/** Personal access tokens for the content MCP endpoint. Only the SHA-256 hash is stored. */
export const mcpToken = mysqlTable(
  "mcp_token",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    prefix: varchar("prefix", { length: 16 }).notNull(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastUsedAt: timestamp("last_used_at", { fsp: 3 }),
    revokedAt: timestamp("revoked_at", { fsp: 3 }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  },
  (table) => [index("mcp_token_user_idx").on(table.userId)],
);

/** Downloadable or linked resources shown on /resources. */
export const resource = mysqlTable(
  "resource",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    summary: varchar("summary", { length: 320 }).notNull(),
    body: longtext("body").notNull(),
    type: varchar("type", { length: 24 }).notNull(),
    url: text("url"),
    category: varchar("category", { length: 64 }).notNull(),
    featured: boolean("featured").default(false).notNull(),
    draft: boolean("draft").default(false).notNull(),
    publishedAt: datetime("published_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("resource_published_idx").on(table.draft, table.publishedAt)],
);
