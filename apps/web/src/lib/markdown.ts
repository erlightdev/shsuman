import { Marked, type Tokens } from "marked";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const safeUrl = (href: string) => (/^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : "#");

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

/**
 * Markdown → HTML for content written in the dashboard editor or over MCP.
 * Raw HTML is escaped and link/image URLs are restricted to safe schemes.
 */
export function renderMarkdown(source: string) {
  const headings: Heading[] = [];
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(text);
      },
      heading({ tokens, depth }: Tokens.Heading) {
        const text = this.parser.parseInline(tokens);
        const slug = slugify(text);
        headings.push({ depth, text: text.replace(/<[^>]+>/g, ""), slug });
        return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:/i.test(href);
        return `<a href="${escapeHtml(safeUrl(href))}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
      },
      image({ href, title, text }: Tokens.Image) {
        return `<img src="${escapeHtml(safeUrl(href))}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ""} loading="lazy" decoding="async" />`;
      },
    },
  });

  const html = marked.parse(source, { async: false }) as string;
  return { html, headings };
}

export function readingTime(body = "") {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
