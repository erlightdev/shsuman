import { orpc } from "@/lib/orpc";

import { useLoader } from "../hooks";
import { ItemTable } from "./ItemTable";

export function ResourceList() {
  const { data, loading } = useLoader(() => orpc.resources.adminList());
  return (
    <ItemTable
      title="Resources"
      description="Guides, templates, checklists, talks and links shown on the Resources page."
      noun="resource"
      basePath="/dashboard/resources"
      publicPath="/resources"
      loading={loading}
      rows={data?.map((item) => ({ ...item, extra: item.type })) ?? null}
    />
  );
}
