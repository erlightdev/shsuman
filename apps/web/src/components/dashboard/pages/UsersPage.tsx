import { ROLES, type Role } from "@shsuman/auth/permissions";
import { Ban, Loader2, MoreHorizontal, Plus, ShieldCheck, Trash2, UserX } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

import { ConfirmDialog } from "../ConfirmDialog";
import { errorMessage, useLoader } from "../hooks";
import { PageHeader } from "../PageHeader";

const roleHelp: Record<Role, string> = {
  admin: "Everything, including users",
  editor: "Content, blog, resources and MCP",
  user: "No dashboard access",
};

async function unwrap<T>(promise: Promise<{ data: T | null; error: { message?: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message || "Request failed");
  return data as T;
}

function CreateUser({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState<Role>("editor");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      await unwrap(
        authClient.admin.createUser({
          name: String(form.get("name")),
          email: String(form.get("email")),
          password: String(form.get("password")),
          role,
        }),
      );
      toast.success("User created.");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button className="rounded-full" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden="true" />
        Add user
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="grid w-full gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="new-name">Name</Label>
        <Input id="new-name" name="name" required autoComplete="off" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-email">Email</Label>
        <Input id="new-email" name="email" type="email" required autoComplete="off" autoCapitalize="none" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">Temporary password</Label>
        <Input id="new-password" name="password" type="password" minLength={8} required autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger className="w-full" aria-label="Role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((item) => (
              <SelectItem key={item} value={item} className="capitalize">
                {item} <span className="text-muted-foreground">· {roleHelp[item]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Create user
        </Button>
      </div>
    </form>
  );
}

export function UsersPage() {
  const { data: session } = authClient.useSession();
  const { data, loading, reload } = useLoader(() =>
    unwrap(authClient.admin.listUsers({ query: { limit: 200, sortBy: "createdAt", sortDirection: "desc" } })),
  );
  const users = data?.users ?? [];

  const act = async (label: string, run: () => Promise<unknown>) => {
    try {
      await run();
      toast.success(label);
      await reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Invite editors, change roles and block access. Editors can manage content but not users."
      />
      <CreateUser onCreated={reload} />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="w-12 pr-5">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const self = user.id === session?.user.id;
                const role = (user.role ?? "user") as Role;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="max-w-0 pl-5">
                      <p className="truncate font-medium text-foreground">
                        {user.name} {self && <span className="text-muted-foreground">(you)</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={role === "user" ? "outline" : "secondary"} className="rounded-full capitalize">
                          {role}
                        </Badge>
                        {user.banned && (
                          <Badge variant="destructive" className="rounded-full">
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      {!self && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${user.email}`}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Role</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                              value={role}
                              onValueChange={(value) =>
                                act("Role updated.", () => unwrap(authClient.admin.setRole({ userId: user.id, role: value as Role })))
                              }
                            >
                              {ROLES.map((item) => (
                                <DropdownMenuRadioItem key={item} value={item} className="capitalize">
                                  {item}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() =>
                                act("Signed out everywhere.", () => unwrap(authClient.admin.revokeUserSessions({ userId: user.id })))
                              }
                            >
                              <UserX className="size-4" aria-hidden="true" />
                              Sign out all sessions
                            </DropdownMenuItem>
                            {user.banned ? (
                              <DropdownMenuItem
                                onSelect={() => act("Access restored.", () => unwrap(authClient.admin.unbanUser({ userId: user.id })))}
                              >
                                <ShieldCheck className="size-4" aria-hidden="true" />
                                Unblock
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={() =>
                                  act("User blocked.", () =>
                                    unwrap(authClient.admin.banUser({ userId: user.id, banReason: "Blocked by admin" })),
                                  )
                                }
                              >
                                <Ban className="size-4" aria-hidden="true" />
                                Block access
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {!self && (
                        <ConfirmDialog
                          title={`Delete ${user.email}?`}
                          description="The account, its sessions and its MCP tokens are permanently removed."
                          confirmLabel="Delete user"
                          onConfirm={() => act("User deleted.", () => unwrap(authClient.admin.removeUser({ userId: user.id })))}
                          trigger={
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" aria-label={`Delete ${user.email}`}>
                              <Trash2 className="size-4" />
                            </Button>
                          }
                        />
                      )}
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
