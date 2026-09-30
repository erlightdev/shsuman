import { ENV } from "@/env";

/**
 * API server origin (auth, oRPC, uploads, MCP). Comes from PUBLIC_SERVER_URL,
 * which is inlined at build time, so a production build must set it to the
 * https API origin. astro.config.mjs refuses to build production with localhost.
 */
function readServerUrl(): string {
  try {
    const val = (ENV as unknown as Record<string, string>).PUBLIC_SERVER_URL;
    if (val) return val.replace(/\/$/, "");
  } catch {
    // Varlock's proxy can throw in the browser for keys it doesn't expose.
  }
  try {
    if (import.meta.env?.PUBLIC_SERVER_URL) return String(import.meta.env.PUBLIC_SERVER_URL).replace(/\/$/, "");
  } catch {}
  return "http://localhost:3000";
}

export const SERVER_URL = readServerUrl();
