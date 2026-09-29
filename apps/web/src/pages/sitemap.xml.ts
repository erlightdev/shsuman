import type { APIRoute } from "astro";
import { getPosts, getResources } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const prerender = false;

export const GET: APIRoute = async () => {
  const [posts, resources] = await Promise.all([getPosts(), getResources()]);
  const day = (value: Date | string) => new Date(value).toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/blog/`, lastmod: posts[0] && day(posts[0].publishedAt), priority: "0.8" },
    { loc: `${SITE_URL}/resources/`, priority: "0.7" },
    ...posts.map((post) => ({ loc: `${SITE_URL}/blog/${post.slug}/`, lastmod: day(post.updatedAt), priority: "0.6" })),
    ...resources
      .filter((item) => item.body.trim())
      .map((item) => ({ loc: `${SITE_URL}/resources/${item.slug}/`, lastmod: day(item.updatedAt), priority: "0.5" })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `  <url>\n    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""}\n    <priority>${url.priority}</priority>\n  </url>`)
  .join("\n")}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" },
  });
};
