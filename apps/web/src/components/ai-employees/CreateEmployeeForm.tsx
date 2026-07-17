"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES = [
  "Receptionist",
  "Sales Rep",
  "SDR",
  "Customer Support",
  "Appointment Setter",
  "Billing Agent",
  "Collections Agent",
  "Insurance Agent",
] as const;

export function CreateEmployeeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/ai-employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          roleTitle: form.get("roleTitle"),
          department: form.get("department"),
          description: form.get("description"),
          language: form.get("language"),
          voice: form.get("voice"),
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ?? "Failed to create AI employee");
        return;
      }
      router.push(`/dashboard/ai-employees/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create AI employee");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Basic information</CardTitle>
        <CardDescription>Step 1 of 6 — name your AI employee and choose a role.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Employee name</Label>
            <Input id="name" name="name" required placeholder="Ava - Dental Receptionist" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roleTitle">Role</Label>
            <select
              id="roleTitle"
              name="roleTitle"
              required
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              defaultValue="Receptionist"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="department">Department</Label>
            <Input id="department" name="department" defaultValue="Front Office" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="language">Language</Label>
            <Input id="language" name="language" defaultValue="English US" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="voice">Voice</Label>
            <Input id="voice" name="voice" defaultValue="Ava Natural" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Short description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Handles inbound calls, books appointments, and answers FAQs."
            />
          </div>
          {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create & continue"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/ai-employees")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
