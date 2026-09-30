import { SERVER_URL } from "@/lib/server-url";

/**
 * Resolves media URLs (e.g. uploaded files from /uploads/...) to absolute or valid URLs,
 * while leaving external http(s) or data URLs intact.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Older uploads were saved with the dev API origin; treat them as site paths.
  const legacy = trimmed.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/uploads\/.+)$/i);
  if (legacy) return `${SERVER_URL}${legacy[1]}`;

  // If already absolute http(s) or data URL, return as-is
  if (/^(https?:\/\/|data:)/i.test(trimmed)) {
    return trimmed;
  }

  // Normalize leading slash for relative uploads paths
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (normalized.startsWith("/uploads/")) {
    return `${SERVER_URL}${normalized}`;
  }

  return trimmed;
}

