import { blogPostInput, COVERS } from "@shsuman/api/content/schema";
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

import { ConfirmDialog } from "../ConfirmDialog";
import { parseTags, TextField, toDateInput } from "../fields";
import { errorMessage, useLoader } from "../hooks";
import { PageHeader } from "../PageHeader";
import { RichTextEditor } from "../RichTextEditor";
import { type FieldErrors, toFieldErrors } from "../SchemaForm";

interface Draft {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string;
  cover: (typeof COVERS)[number];
  coverImage: string;
  draft: boolean;
  publishedAt: string;
  body: string;
}

const blank: Draft = {
  title: "",
  slug: "",
  description: "",
  category: "Security",
  tags: "",
  cover: "rings",
  coverImage: "",
  draft: true,
  publishedAt: toDateInput(undefined),
  body: "",
};

export function PostEditor({ slug }: { slug: string }) {
  const isNew = slug === "new";
  const [form, setForm] = useState<Draft | null>(isNew ? blank : null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [currentSlug, setCurrentSlug] = useState(slug);

  const { loading, error } = useLoader(async () => {
    if (isNew) return null;
    const post = await orpc.blog.adminGet({ slug });
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      category: post.category,
      tags: post.tags.join(", "),
      cover: post.cover as Draft["cover"],
      coverImage: post.coverImage ?? "",
      draft: post.draft,
      publishedAt: toDateInput(post.publishedAt),
      body: post.body,
    });
    return post;
  }, [slug]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  async function save() {
    if (!form) return;
    const input = {
      title: form.title,
      slug: form.slug || undefined,
      description: form.description,
      category: form.category,
      tags: parseTags(form.tags),
      cover: form.cover,
      coverImage: form.coverImage || null,
      draft: form.draft,
      publishedAt: new Date(form.publishedAt),
      body: form.body,
    };
    const parsed = blogPostInput.safeParse(input);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error.issues));
      toast.error("Check the highlighted fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const post = isNew
        ? await orpc.blog.create(parsed.data)
        : await orpc.blog.update({ slug: currentSlug, data: parsed.data });
      toast.success(form.draft ? "Draft saved." : "Post published.");
      if (isNew || post.slug !== currentSlug) {
        window.location.replace(`/dashboard/blog/${post.slug}`);
        return;
      }
      setCurrentSlug(post.slug);
      set("slug", post.slug);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await orpc.blog.delete({ slug: currentSlug });
      toast.success("Post deleted.");
      window.location.replace("/dashboard/blog");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="space-y-4">
        <a href="/dashboard/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Blog
        </a>
        <PageHeader
          title={isNew ? "New post" : "Edit post"}
          actions={
            !isNew && (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <a href={`/blog/${currentSlug}/`} target="_blank" rel="noopener">
                    <ExternalLink className="size-4" aria-hidden="true" />
                    View
                  </a>
                </Button>
                <ConfirmDialog
                  title="Delete this post?"
                  description="The post is removed from the website permanently. To hide it instead, switch it to draft."
                  confirmLabel="Delete post"
                  onConfirm={remove}
                  trigger={
                    <Button type="button" variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </Button>
                  }
                />
              </>
            )
          }
        />
      </div>

      {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage(error)}</p>}

      {loading || !form ? (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0 space-y-6">
            <TextField label="Title" value={form.title} onChange={(v) => set("title", v)} error={errors.title} max={200} />
            <TextField
              label="Summary"
              value={form.description}
              onChange={(v) => set("description", v)}
              error={errors.description}
              max={320}
              multiline
              hint="Shown on cards and used as the search description."
            />
            <div className="space-y-2">
              <Label>Article</Label>
              <RichTextEditor value={form.body} onChange={(v) => set("body", v)} aria-label="Article body" placeholder="Write your article…" />
              {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="post-draft">Draft</Label>
                <Switch id="post-draft" checked={form.draft} onCheckedChange={(v) => set("draft", v)} />
              </div>
              <TextField label="Publish date" type="datetime-local" value={form.publishedAt} onChange={(v) => set("publishedAt", v)} error={errors.publishedAt} />
              <TextField
                label="URL slug"
                value={form.slug}
                onChange={(v) => set("slug", v)}
                error={errors.slug}
                placeholder="generated from title"
                hint="Lowercase letters, numbers and hyphens."
              />
              <TextField label="Category" value={form.category} onChange={(v) => set("category", v)} error={errors.category} />
              <TextField label="Tags" value={form.tags} onChange={(v) => set("tags", v)} error={errors.tags} hint="Separate with commas." />
            </div>

            <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
              <div className="space-y-2">
                <Label>Cover style</Label>
                <Select value={form.cover} onValueChange={(v) => set("cover", v as Draft["cover"])}>
                  <SelectTrigger className="w-full" aria-label="Cover style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COVERS.map((cover) => (
                      <SelectItem key={cover} value={cover} className="capitalize">
                        {cover}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TextField
                label="Cover image (optional)"
                type="url"
                value={form.coverImage}
                onChange={(v) => set("coverImage", v)}
                error={errors.coverImage}
                placeholder="https://…"
                hint="Replaces the generated cover art."
              />
            </div>
          </aside>
        </div>
      )}

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-border bg-background/90 p-3 shadow-md backdrop-blur">
        <p className="mr-auto pl-2 text-sm flex items-center gap-2">
          <span className={cn("size-2 rounded-full", form?.draft ? "bg-amber-500" : "bg-emerald-500 animate-pulse")} />
          <span className="text-muted-foreground">{form?.draft ? "Saved as draft" : "Visible on the website"}</span>
        </p>
        <Button
          type="submit"
          className={cn(
            "rounded-full transition-all",
            !form?.draft && "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20"
          )}
          disabled={saving || !form}
        >
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {form?.draft ? "Save draft" : isNew ? "Publish post" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
