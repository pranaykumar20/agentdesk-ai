"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteMemberForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToken(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          role: form.get("role"),
          department: form.get("department"),
        }),
      });
      const data = (await res.json()) as { error?: string; inviteToken?: string };
      if (!res.ok) {
        setError(data.error ?? "Invite failed");
        return;
      }
      setToken(data.inviteToken ?? null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + Invite Member
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="role">Role</Label>
          <select id="role" name="role" className="h-10 w-full rounded-lg border border-input px-3 text-sm" defaultValue="AGENT">
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="AGENT">Agent</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" defaultValue="Front Desk" required />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {token ? (
        <p className="break-all rounded-lg bg-muted p-2 text-xs text-muted-foreground">
          Invite token (expires in 7 days): {token}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send invite"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </form>
  );
}
