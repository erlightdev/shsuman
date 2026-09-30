import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@shsuman/api/routers/index";

import { ENV } from "../env";

function getApiBaseUrl(): string {
  try {
    if (typeof ENV !== "undefined" && ENV) {
      const val = (ENV as unknown as Record<string, string>)["PUBLIC_SERVER_URL"];
      if (val) return val.replace(/\/$/, "");
    }
  } catch {}
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_SERVER_URL) {
      return String(import.meta.env.PUBLIC_SERVER_URL).replace(/\/$/, "");
    }
  } catch {}
  return "http://localhost:3000";
}

export const link = new RPCLink({
  url: `${getApiBaseUrl()}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const orpc: AppRouterClient = createORPCClient(link);
