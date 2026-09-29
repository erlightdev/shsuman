import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Database } from "@shsuman/db";
import { mcpToken, user } from "@shsuman/db/schema/index";
import { and, desc, eq, isNull } from "drizzle-orm";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

/** Creates a token and returns the plain value once; only its hash is stored. */
export async function createToken(db: Database, userId: string, name: string) {
  const secret = `sks_${randomBytes(24).toString("base64url")}`;
  const id = randomUUID();
  await db.insert(mcpToken).values({ id, name, prefix: secret.slice(0, 12), tokenHash: hash(secret), userId });
  return { id, name, token: secret };
}

export async function listTokens(db: Database) {
  return db
    .select({
      id: mcpToken.id,
      name: mcpToken.name,
      prefix: mcpToken.prefix,
      createdAt: mcpToken.createdAt,
      lastUsedAt: mcpToken.lastUsedAt,
      revokedAt: mcpToken.revokedAt,
      owner: user.email,
    })
    .from(mcpToken)
    .leftJoin(user, eq(user.id, mcpToken.userId))
    .orderBy(desc(mcpToken.createdAt));
}

export async function revokeToken(db: Database, id: string) {
  await db.update(mcpToken).set({ revokedAt: new Date() }).where(eq(mcpToken.id, id));
}

/**
 * Resolves a bearer token to its owner. Returns null for unknown or revoked
 * tokens and for owners who are no longer admin/editor or are banned.
 */
export async function verifyToken(db: Database, secret: string) {
  const [row] = await db
    .select({ id: mcpToken.id, userId: mcpToken.userId, email: user.email, role: user.role, banned: user.banned })
    .from(mcpToken)
    .innerJoin(user, eq(user.id, mcpToken.userId))
    .where(and(eq(mcpToken.tokenHash, hash(secret)), isNull(mcpToken.revokedAt)));
  if (!row || row.banned) return null;
  const roles = (row.role ?? "").split(",").map((role) => role.trim());
  if (!roles.includes("admin") && !roles.includes("editor")) return null;
  await db.update(mcpToken).set({ lastUsedAt: new Date() }).where(eq(mcpToken.id, row.id));
  return row;
}
