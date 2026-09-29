import { ac, roles } from "@shsuman/auth/permissions";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ENV } from "../env";

export const authClient = createAuthClient({
  baseURL: ENV.PUBLIC_SERVER_URL,
  plugins: [adminClient({ ac, roles })],
});

export type SessionUser = NonNullable<ReturnType<typeof authClient.useSession>["data"]>["user"];
