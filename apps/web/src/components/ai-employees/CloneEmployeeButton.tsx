"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CloneEmployeeButton({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={busy}
      onClick={() => {
        void (async () => {
          setBusy(true);
          try {
            const res = await fetch("/api/ai-employees/clone", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: employeeId }),
            });
            const data = (await res.json()) as { id?: string; error?: string };
            if (!res.ok || !data.id) throw new Error(data.error ?? "Clone failed");
            router.push(`/dashboard/ai-employees/${data.id}`);
            router.refresh();
          } catch {
            setBusy(false);
          }
        })();
      }}
    >
      {busy ? "Cloning…" : "Clone"}
    </Button>
  );
}
