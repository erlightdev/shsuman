import { Check, Copy, KeyRound, Loader2, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/lib/orpc";
import { SERVER_URL } from "@/lib/server-url";

import { ConfirmDialog } from "../ConfirmDialog";
import { errorMessage, useLoader } from "../hooks";
import { PageHeader } from "../PageHeader";

const endpoint = `${SERVER_URL}/mcp`;

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 shrink-0"
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <div className="relative rounded-xl border border-border bg-muted">
      <pre className="overflow-x-auto p-4 pr-12 font-mono text-xs leading-6 text-foreground">{code}</pre>
      <div className="absolute top-2 right-2">
        <CopyButton value={code} label="Copy snippet" />
      </div>
    </div>
  );
}

export function McpPage() {
  const tokens = useLoader(() => orpc.mcp.tokens());
  const tools = useLoader(() => orpc.mcp.tools());
  const [creating, setCreating] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);

  const token = fresh ?? "YOUR_TOKEN";
  const snippets = {
    claudeCode: `claude mcp add --transport http shsuman-content ${endpoint} \\\n  --header "Authorization: Bearer ${token}"`,
    desktop: JSON.stringify(
      {
        mcpServers: {
          "shsuman-content": {
            command: "npx",
            args: ["-y", "mcp-remote", endpoint, "--header", `Authorization: Bearer ${token}`],
          },
        },
      },
      null,
      2,
    ),
    http: JSON.stringify(
      { mcpServers: { "shsuman-content": { type: "http", url: endpoint, headers: { Authorization: `Bearer ${token}` } } } },
      null,
      2,
    ),
  };

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name"));
    setCreating(true);
    try {
      const result = await orpc.mcp.createToken({ name });
      setFresh(result.token);
      form.reset();
      await tokens.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    try {
      await orpc.mcp.revokeToken({ id });
      toast.success("Token revoked.");
      await tokens.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="MCP connection"
        description="Let an AI assistant (Claude, Cursor and other MCP clients) edit site content for you: homepage text, links, images, icons, blog posts and resources. It can't change design, layout or users."
      />

      <section aria-labelledby="endpoint-title" className="space-y-3">
        <h2 id="endpoint-title" className="text-sm font-medium">
          Endpoint
        </h2>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
          <code className="min-w-0 flex-1 truncate font-mono text-sm">{endpoint}</code>
          <Badge variant="brand" className="rounded-full">
            Streamable HTTP
          </Badge>
          <CopyButton value={endpoint} label="Copy endpoint" />
        </div>
      </section>

      <section aria-labelledby="tokens-title" className="space-y-4">
        <h2 id="tokens-title" className="text-sm font-medium">
          Access tokens
        </h2>
        <form onSubmit={create} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 space-y-2">
            <Label htmlFor="token-name">Token name</Label>
            <Input id="token-name" name="name" required maxLength={100} placeholder="e.g. Claude Desktop on laptop" />
          </div>
          <Button type="submit" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20" disabled={creating}>
            {creating ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            Create token
          </Button>
        </form>

        {fresh && (
          <div role="status" className="space-y-2 rounded-xl border border-brand-base/40 bg-brand-8 p-4">
            <p className="text-sm font-medium text-foreground">Copy this token now. It won't be shown again.</p>
            <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-1.5">
              <code className="min-w-0 flex-1 truncate font-mono text-sm">{fresh}</code>
              <CopyButton value={fresh} label="Copy token" />
            </div>
          </div>
        )}

        {tokens.loading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : tokens.data?.length ? (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {tokens.data.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {item.prefix}… · {item.owner} · {item.lastUsedAt ? `used ${new Date(item.lastUsedAt).toLocaleString()}` : "never used"}
                  </p>
                </div>
                {item.revokedAt ? (
                  <Badge variant="outline" className="rounded-full">
                    Revoked
                  </Badge>
                ) : (
                  <ConfirmDialog
                    title={`Revoke “${item.name}”?`}
                    description="Any MCP client using this token loses access immediately."
                    confirmLabel="Revoke token"
                    onConfirm={() => revoke(item.id)}
                    trigger={
                      <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-destructive">
                        Revoke
                      </Button>
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No tokens yet. Create one to connect a client.</p>
        )}
      </section>

      <section aria-labelledby="connect-title" className="space-y-4">
        <h2 id="connect-title" className="text-sm font-medium">
          Connect a client
        </h2>
        <Tabs defaultValue="claude-code">
          <TabsList>
            <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
            <TabsTrigger value="desktop">Claude Desktop</TabsTrigger>
            <TabsTrigger value="http">Other clients</TabsTrigger>
          </TabsList>
          <TabsContent value="claude-code" className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">Run in a terminal:</p>
            <Snippet code={snippets.claudeCode} />
          </TabsContent>
          <TabsContent value="desktop" className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">Add to claude_desktop_config.json, then restart Claude Desktop:</p>
            <Snippet code={snippets.desktop} />
          </TabsContent>
          <TabsContent value="http" className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">For clients that support remote HTTP servers (Cursor, VS Code, etc.):</p>
            <Snippet code={snippets.http} />
          </TabsContent>
        </Tabs>
      </section>

      <section aria-labelledby="tools-title" className="space-y-4">
        <h2 id="tools-title" className="text-sm font-medium">
          Available tools
        </h2>
        {tools.loading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {tools.data?.map((tool) => (
              <li key={tool.name} className="group rounded-xl border border-border p-4 transition-all hover:border-emerald-500/30 hover:bg-brand-8/30">
                <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">{tool.name}</p>
                <p className="mt-1 text-sm font-medium text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{tool.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
