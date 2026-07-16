import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: number;
  icon?: LucideIcon;
  iconClassName?: string;
}) {
  const up = trend != null && trend >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {trend != null ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                up ? "text-success" : "text-destructive",
              )}
            >
              {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {up ? "+" : ""}
              {trend}% vs previous week
            </p>
          ) : null}
          {hint && trend == null ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary", iconClassName)}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}
