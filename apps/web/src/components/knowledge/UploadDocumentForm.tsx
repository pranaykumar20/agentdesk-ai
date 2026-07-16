"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];
const MAX_BYTES = 10 * 1024 * 1024;

export function UploadDocumentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File | null;
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "General");

    if (!title) {
      setError("Title is required");
      setLoading(false);
      return;
    }
    if (!file || file.size === 0) {
      setError("Choose a file");
      setLoading(false);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be 10MB or smaller");
      setLoading(false);
      return;
    }
    if (file.type && !ALLOWED.includes(file.type)) {
      setError("Only PDF, DOCX, TXT, or Markdown files are allowed");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/knowledge/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          mimeType: file.type || "text/plain",
          byteSize: file.size,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + New Article
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="space-y-1">
        <Label htmlFor="title">Article title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue="General" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="file">File (PDF, DOCX, TXT — max 10MB)</Label>
        <Input id="file" name="file" type="file" accept=".pdf,.docx,.txt,.md,application/pdf,text/plain" required />
      </div>
      <p className="text-xs text-muted-foreground">
        Phase D stores metadata and runs a mock processing workflow. Binary upload to private storage lands in a later phase.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading…" : "Upload"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
