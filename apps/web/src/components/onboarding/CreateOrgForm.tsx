"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export function CreateOrgForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("general");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/org/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to create organization");
        return;
      }
      router.push(AUTH_ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Business name</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <select
          id="industry"
          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="general">General / Other</option>
          <option value="healthcare_dental">Dental</option>
          <option value="healthcare_medical">Medical clinic</option>
          <option value="home_services">Home services / HVAC</option>
          <option value="auto_repair">Auto repair</option>
          <option value="legal">Law firm</option>
          <option value="real_estate">Real estate</option>
          <option value="property_management">Property management</option>
          <option value="restaurant">Restaurant</option>
          <option value="insurance">Insurance</option>
        </select>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating…" : "Continue"}
      </Button>
    </form>
  );
}
