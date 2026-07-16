"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAppointmentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: form.get("contactName"),
          serviceName: form.get("serviceName"),
          providerName: form.get("providerName"),
          startsAt: form.get("startsAt"),
          endsAt: form.get("endsAt"),
          notes: form.get("notes") || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to create appointment");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + New Appointment
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="space-y-1">
        <Label htmlFor="contactName">Patient / contact name</Label>
        <Input id="contactName" name="contactName" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="serviceName">Service</Label>
        <Input id="serviceName" name="serviceName" defaultValue="Teeth Cleaning" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="providerName">Provider</Label>
        <Input id="providerName" name="providerName" defaultValue="Dr. Sarah Johnson" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="startsAt">Starts at</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endsAt">Ends at</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local" required />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
