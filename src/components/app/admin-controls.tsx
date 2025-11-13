"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserCheck, UserMinus, Users, RefreshCcw, ShieldAlert, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type ManagedUser = {
  id: string;
  email: string;
  role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
};

type FetchState = "idle" | "loading" | "error";

export default function AdminControls() {
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setFetchState("loading");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load users");
      }
      const data = await response.json();
      setUsers(data.users ?? []);
      setFetchState("idle");
    } catch (error) {
      console.error(error);
      setFetchState("error");
      toast({
        variant: "destructive",
        title: "Unable to load users",
        description: "Check your connection and try again.",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const promoteDemote = async (id: string, role: "user" | "admin") => {
    setActionUserId(id);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to update role");
      }
      toast({
        title: "Role updated",
        description: "User permissions refreshed successfully.",
      });
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Could not update role",
        description:
          error instanceof Error ? error.message : "Something went wrong while updating the role.",
      });
    } finally {
      setActionUserId(null);
    }
  };

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((user) => user.role === "admin").length;
    const members = total - admins;
    return { total, admins, members };
  }, [users]);

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200/60 bg-emerald-50/60 text-emerald-900 shadow-inner shadow-emerald-100/60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-3 text-xl">
            <ShieldAlert className="h-5 w-5" />
            Platform governance overview
          </CardTitle>
          <CardDescription className="text-sm text-emerald-800/80 dark:text-emerald-100/70">
            Keep user access aligned with compliance, revoke dormant admin accounts, and encourage
            secure sign-ins.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm shadow-sm dark:border-emerald-400/20 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Total members</p>
            <p className="mt-2 text-2xl font-semibold">{stats.total}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-200/60">
              Active accounts in the workspace
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm shadow-sm dark:border-emerald-400/20 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Administrators</p>
            <p className="mt-2 text-2xl font-semibold">{stats.admins}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-200/60">
              People with elevated privileges
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm shadow-sm dark:border-emerald-400/20 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Members</p>
            <p className="mt-2 text-2xl font-semibold">{stats.members}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-200/60">
              Standard users consuming experiences
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-headline">User directory</CardTitle>
            <CardDescription>
              Promote trusted team members to admin or return them to standard access.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={fetchState === "loading"}
            className="inline-flex items-center gap-2"
          >
            {fetchState === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetchState === "loading" && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex items-center justify-center gap-3 py-6 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users…
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {fetchState === "error" && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      Could not fetch users. Try refreshing the table.
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {fetchState === "idle" && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex items-center justify-center gap-3 py-6 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      No members found yet.
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{user.email}</span>
                      <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="rounded-full capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionUserId === user.id || user.role === "admin"}
                        onClick={() => promoteDemote(user.id, "admin")}
                        className="inline-flex items-center gap-2"
                      >
                        {actionUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                        Promote
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionUserId === user.id || user.role !== "admin"}
                        onClick={() => promoteDemote(user.id, "user")}
                        className="inline-flex items-center gap-2 text-destructive hover:text-destructive"
                      >
                        {actionUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                        Revoke
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

