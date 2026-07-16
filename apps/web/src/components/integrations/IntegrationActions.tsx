"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function IntegrationActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(next: string) {
    startTransition(async () => {
      await fetch(`/api/integrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  }

  if (status === "connected") {
    return (
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => setStatus("disconnected")}>
        Disconnect
      </Button>
    );
  }

  if (status === "needs_attention") {
    return (
      <Button type="button" size="sm" disabled={pending} onClick={() => setStatus("connected")}>
        Reconnect
      </Button>
    );
  }

  return (
    <Button type="button" size="sm" disabled={pending} onClick={() => setStatus("connected")}>
      Connect
    </Button>
  );
}
