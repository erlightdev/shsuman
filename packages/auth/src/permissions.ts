import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Roles:
 * - admin:  everything, including user management
 * - editor: site content, blog, resources and MCP tokens
 * - user:   signed in, no dashboard access
 */
export const statement = {
  ...defaultStatements,
  content: ["update"],
  mcp: ["manage"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  content: ["update"],
  mcp: ["manage"],
});

export const editor = ac.newRole({
  content: ["update"],
  mcp: ["manage"],
});

export const user = ac.newRole({});

export const roles = { admin, editor, user };

export type Role = keyof typeof roles;

export const ROLES: Role[] = ["admin", "editor", "user"];

export function hasRole(value: string | null | undefined, ...allowed: Role[]) {
  if (!value) return false;
  return value.split(",").some((role) => allowed.includes(role.trim() as Role));
}
