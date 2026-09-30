import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@shsuman/api/routers/index";

import { SERVER_URL } from "./server-url";

export const link = new RPCLink({
  url: `${SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const orpc: AppRouterClient = createORPCClient(link);
