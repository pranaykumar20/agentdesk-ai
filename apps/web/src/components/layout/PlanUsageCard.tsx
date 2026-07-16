import Link from "next/link";
import { cn } from "@/lib/utils";

export function PlanUsageCard({
  planName,
  minutesUsed,
  minutesIncluded,
  className,
}: {
  planName: string;
  minutesUsed: number;
  minutesIncluded: number;
  className?: string;
}) {
  const pct = minutesIncluded > 0 ? Math.min(100, Math.round((minutesUsed / minutesIncluded) * 100)) : 0;

  return (
    <div className={cn("rounded-xl border border-border bg-background p-3", className)}>
      <p className="text-xs font-semibold text-foreground">{planName}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {minutesUsed.toLocaleString()} / {minutesIncluded.toLocaleString()} mins used
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <Link
        href="/dashboard/settings"
        className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted"
      >
        Upgrade Plan
      </Link>
    </div>
  );
}
