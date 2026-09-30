import node from "@astrojs/node";
import react from "@astrojs/react";
// @ts-check
import tailwindcss from "@tailwindcss/vite";
import varlockAstroIntegration from "@varlock/astro-integration";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://shsuman.com.np",
  integrations: [varlockAstroIntegration({ ssrInjectMode: "auto-load" }), react()],
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
