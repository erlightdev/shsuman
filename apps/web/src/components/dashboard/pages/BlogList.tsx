import { orpc } from "@/lib/orpc";

import { useLoader } from "../hooks";
import { ItemTable } from "./ItemTable";

export function BlogList() {
  const { data, loading } = useLoader(() => orpc.blog.adminList());
  return (
    <ItemTable
      title="Blog"
      description="Write and publish articles. Drafts stay hidden from the website."
      noun="post"
      basePath="/dashboard/blog"
      publicPath="/blog"
      loading={loading}
      rows={data?.map((post) => ({ ...post, extra: post.tags.join(", ") })) ?? null}
    />
  );
}
