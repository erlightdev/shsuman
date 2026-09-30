import node from "@astrojs/node";
import react from "@astrojs/react";
// @ts-check
import tailwindcss from "@tailwindcss/vite";
import varlockAstroIntegration from "@varlock/astro-integration";
import { defineConfig } from "astro/config";
import { ENV } from "varlock/env";

/**
 * PUBLIC_SERVER_URL is inlined into the client at build time (auth, API,
 * uploads and the MCP endpoint shown in the dashboard). Stop a production
 * build that would ship a localhost or plain-http API URL.
 */
const requireHttpsServerUrl = {
  name: "require-https-server-url",
  hooks: {
    "astro:build:start": () => {
      const url = String(ENV.PUBLIC_SERVER_URL ?? "");
      const local = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(url);
      if (process.env.ALLOW_LOCAL_SERVER_URL !== "1" && (local || !url.startsWith("https://"))) {
        throw new Error(
          `PUBLIC_SERVER_URL is "${url}". Set it to the https API origin for production builds, ` +
            "e.g. PUBLIC_SERVER_URL=https://api.shsuman.com.np (or ALLOW_LOCAL_SERVER_URL=1 for a local test build).",
        );
      }
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://shsuman.com.np",
  integrations: [varlockAstroIntegration({ ssrInjectMode: "auto-load" }), react(), requireHttpsServerUrl],
  output: "server",
  adapter: node({ mode: "standalone" }),
  vite: {
    server: {
      proxy: {
        "/uploads": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    plugins: [tailwindcss()],
    // Prebundle client deps up front so the dev server doesn't re-optimize
    // mid-session (which breaks islands with "504 Outdated Optimize Dep").
    optimizeDeps: {
      include: [
        "better-auth/react",
        "better-auth/client/plugins",
        "better-auth/plugins/access",
        "better-auth/plugins/admin/access",
        "motion/react",
        "lucide-react",
        "radix-ui",
        "sonner",
        "zod",
        "@tiptap/react",
        "@tiptap/starter-kit",
        "@tiptap/markdown",
        "@tiptap/extension-image",
        "@tiptap/extensions",
        "@orpc/client",
        "@orpc/client/fetch",
      ],
    },
  },
});
