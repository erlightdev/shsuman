import { ac, roles } from "@shsuman/auth/permissions";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ENV } from "../env";

function getAuthBaseUrl(): string {
  try {
    if (typeof ENV !== "undefined" && ENV) {
      const val = (ENV as unknown as Record<string, string>)["PUBLIC_SERVER_URL"];
      if (val) return val;
    }
  } catch {}
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_SERVER_URL) {
      return String(import.meta.env.PUBLIC_SERVER_URL);
    }
  } catch {}
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  plugins: [adminClient({ ac, roles })],
});

export type SessionUser = NonNullable<ReturnType<typeof authClient.useSession>["data"]>["user"];
