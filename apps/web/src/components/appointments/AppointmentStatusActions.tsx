"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function AppointmentStatusActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function update(next: string) {
    startTransition(async () => {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status !== "confirmed" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => update("confirmed")}
          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
        >
          Confirm
        </button>
      ) : null}
      {status !== "cancelled" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => update("cancelled")}
          className="rounded-md border border-border px-2 py-1 text-xs text-destructive hover:bg-muted"
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
}
