import { ENV } from "@/env";

function getServerBase(): string {
  try {
    if (typeof ENV !== "undefined" && ENV) {
      const val = (ENV as unknown as Record<string, string>)["PUBLIC_SERVER_URL"];
      if (val) return val.replace(/\/$/, "");
    }
  } catch {
    // Varlock proxy throws in client environment if not exposed
  }
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_SERVER_URL) {
      return String(import.meta.env.PUBLIC_SERVER_URL).replace(/\/$/, "");
    }
  } catch {}
  return "";
}

/**
 * Resolves media URLs (e.g. uploaded files from /uploads/...) to absolute or valid URLs,
 * while leaving external http(s) or data URLs intact.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // If already absolute http(s) or data URL, return as-is
  if (/^(https?:\/\/|data:)/i.test(trimmed)) {
    return trimmed;
  }

  // Normalize leading slash for relative uploads paths
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (normalized.startsWith("/uploads/")) {
    const serverBase = getServerBase();
    return serverBase ? `${serverBase}${normalized}` : normalized;
  }

  return trimmed;
}

