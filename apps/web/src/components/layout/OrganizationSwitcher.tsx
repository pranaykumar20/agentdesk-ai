"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrgOption = {
  id: string;
  name: string;
  role: string;
};

export function OrganizationSwitcher({
  organizations,
  activeOrgId,
  activeRole,
}: {
  organizations: OrgOption[];
  activeOrgId: string;
  activeRole: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const active = organizations.find((o) => o.id === activeOrgId) ?? organizations[0];
  const initial = active?.name?.charAt(0)?.toUpperCase() ?? "O";

  async function switchOrg(organizationId: string) {
    if (organizationId === activeOrgId) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/org/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-2 text-left hover:bg-muted"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch organization"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{active?.name ?? "Organization"}</span>
          <span className="block truncate text-xs text-muted-foreground">{activeRole}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute bottom-full left-0 z-50 mb-2 max-h-64 w-full overflow-auto rounded-xl border border-border bg-card p-1 shadow-lg"
        >
          {organizations.map((org) => (
            <li key={org.id}>
              <button
                type="button"
                role="option"
                aria-selected={org.id === activeOrgId}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted",
                  org.id === activeOrgId && "bg-accent text-accent-foreground",
                )}
                onClick={() => void switchOrg(org.id)}
              >
                <span className="min-w-0 flex-1 truncate font-medium">{org.name}</span>
                {org.id === activeOrgId ? <Check className="h-4 w-4 text-primary" aria-hidden /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
