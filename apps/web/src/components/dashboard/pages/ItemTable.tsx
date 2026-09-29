import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { EmptyState, PageHeader } from "../PageHeader";

export interface ItemRow {
  slug: string;
  title: string;
  category: string;
  draft: boolean;
  publishedAt: Date | string;
  updatedAt: Date | string;
  extra?: string;
}

interface Props {
  title: string;
  description: string;
  noun: string;
  basePath: string;
  publicPath: string;
  rows: ItemRow[] | null;
  loading: boolean;
}

/** Shared list view for blog posts and resources. */
export function ItemTable({ title, description, noun, basePath, publicPath, rows, loading }: Props) {
  const newButton = (
    <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-all">
      <a href={`${basePath}/new`}>
        <Plus className="size-4" aria-hidden="true" />
        New {noun}
      </a>
    </Button>
  );

  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} actions={newButton} />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : !rows?.length ? (
        <EmptyState title={`No ${noun}s yet`} description={`Create your first ${noun} to publish it on the website.`} action={newButton} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Title</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden pr-5 text-right md:table-cell">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const scheduled = !row.draft && new Date(row.publishedAt) > new Date();
                return (
                  <TableRow key={row.slug}>
                    <TableCell className="max-w-0 pl-5">
                      <a href={`${basePath}/${row.slug}`} className="block truncate font-medium text-foreground hover:underline">
                        {row.title}
                      </a>
                      <span className="block truncate text-xs text-muted-foreground">
                        {publicPath}/{row.slug}/{row.extra ? ` · ${row.extra}` : ""}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{row.category}</TableCell>
                    <TableCell>
                      <Badge variant={row.draft ? "outline" : scheduled ? "secondary" : "brand"} className="rounded-full">
                        {row.draft ? "Draft" : scheduled ? "Scheduled" : "Published"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden pr-5 text-right tabular-nums text-muted-foreground md:table-cell">
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
