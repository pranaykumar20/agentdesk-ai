"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function MemberRoleSelect({ id, role }: { id: string; role: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      defaultValue={role}
      disabled={pending || role === "OWNER"}
      aria-label="Change role"
      onChange={(e) => {
        startTransition(async () => {
          await fetch(`/api/team/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: e.target.value }),
          });
          router.refresh();
        });
      }}
    >
      <option value="OWNER">Owner</option>
      <option value="ADMIN">Admin</option>
      <option value="MANAGER">Manager</option>
      <option value="AGENT">Agent</option>
      <option value="VIEWER">Viewer</option>
    </select>
  );
}
